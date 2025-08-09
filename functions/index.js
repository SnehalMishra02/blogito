// my-automated-blog/functions/index.js

// No need for require('dotenv').config(); in Cloud Functions

const {onRequest} = require('firebase-functions/v2/https');
const {onSchedule} = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');
const {google} = require('googleapis');
const express = require('express');

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
db.settings({databaseId: 'blogoto-blog-store'});

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

// --- Google API Clients Setup ---
// These will be initialized with credentials obtained during OAuth flow
let oauth2Client;
let driveClient;

// --- Helper Functions for Token Management ---
// Store/retrieve OAuth tokens in Firestore for persistence
const TOKEN_DOC_ID = 'google_tokens'; // Fixed document ID for storing tokens


async function getTokens() {
  const docRef = db.collection('settings').doc(TOKEN_DOC_ID);
  const doc = await docRef.get();
  if (doc.exists) {
    return doc.data();
  }
  return null;
}

// Function to get the latest startPageToken from Google Drive appDataFolder
async function getStartPageToken() {
  try {
    const fileList = await driveClient.files.list({
      spaces: 'appDataFolder',
      q: 'name=\'startPageToken.json\'',
      fields: 'files(id)',
    });

    if (!fileList.data.files || fileList.data.files.length === 0) {
      console.warn('No startPageToken.json file found in appDataFolder.');
      return null;
    }

    const fileContent = await driveClient.files.get({
      fileId: fileList.data.files[0].id,
      alt: 'media',
    }, {responseType: 'stream'});

    let data = '';
    for await (const chunk of fileContent.data) {
      data += chunk.toString();
    }
    return JSON.parse(data).startPageToken;
  } catch (error) {
    console.warn('Could not retrieve startPageToken from appDataFolder. Assuming first run or error.', error.message);
  }
  return null;
}


// Function to update the startPageToken in Google Drive appDataFolder
async function updateStartPageToken(token) {
  const appDataFileId = 'startPageToken.json';
  const appDataContent = JSON.stringify({startPageToken: token});

  try {
    const fileList = await driveClient.files.list({
      spaces: 'appDataFolder',
      q: `name='${appDataFileId}'`,
      fields: 'files(id)',
    });

    if (fileList.data.files.length > 0) {
      const existingFileId = fileList.data.files[0].id;
      await driveClient.files.update({
        fileId: existingFileId,
        media: {
          mimeType: 'application/json',
          body: appDataContent,
        },
      });
      console.log('Updated startPageToken in appDataFolder.');
    } else {
      await driveClient.files.create({
        resource: {
          name: appDataFileId,
          parents: ['appDataFolder'],
          mimeType: 'application/json',
        },
        media: {
          mimeType: 'application/json',
          body: appDataContent,
        },
      });
      console.log('Created startPageToken in appDataFolder.');
    }
  } catch (error) {
    console.error('Error updating startPageToken in appDataFolder:', error);
    throw error; // Re-throw to indicate failure
  }
}

// Function to clean HTML content from Google Docs export
const sanitizeHtml = require('sanitize-html');

function cleanHtml(html) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      // This wildcard allows the 'style' attribute on ANY tag
      '*': ['style'],
      // We still specify other allowed attributes for links and images
      "a": ['href', 'name', 'target'],
      "img": ['src', 'alt', 'title', 'width', 'height', 'style'],
    },
    allowedSchemes: ['data', 'http', 'https'],
  });
}

// TEST
app.get('/test-firestore', async (req, res) => {
  try {
    console.log('Firestore initialized with project:', db.projectId);
    await db.collection('settings').doc('test_doc').set({hello: 'world'});
    res.send('Success writing to Firestore!');
  } catch (err) {
    console.error('Firestore write failed:', err);
    res.status(500).send(err.message);
  }
});


// --- OAuth2 Authorization Flow ---
// This endpoint STARTS the Google OAuth flow by redirecting to the consent screen
app.get('/auth', (req, res) => {
  oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
  );

  const scopes = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/documents.readonly',
    'https://www.googleapis.com/auth/drive.appdata',
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // This is important to get a refresh token
    scope: scopes,
  });

  res.redirect(authUrl);
});

// This endpoint initiates the Google OAuth flow.
app.get('/oauth2callback', async (req, res) => {
  console.log('--- Starting /oauth2callback ---'); // NEW LOG
  const {code} = req.query;
  if (!code) {
    return res.status(400).send('Authorization code missing.');
  }

  try {
    oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI,
    );

    console.log('Step 1: Exchanging authorization code for tokens...'); // NEW LOG
    const {tokens} = await oauth2Client.getToken(code);
    console.log('Step 2: Tokens received successfully.'); // NEW LOG
    console.log("Received tokens:", tokens);
    oauth2Client.setCredentials(tokens);
    console.log('Firestore initialized with project:', db.projectId);
    console.log('Step 3: Saving tokens to Firestore...'); // NEW LOG
    const docRef = db.collection('settings').doc(TOKEN_DOC_ID);
    try {
      console.log("Writing tokens to Firestore:", tokens);
      await docRef.set(tokens);
      console.log("✅ Tokens written successfully.");
    } catch (writeErr) {
      console.error("❌ Firestore write failed:", writeErr);
    }

    console.log('Step 4: Tokens saved to Firestore successfully.'); // NEW LOG

    driveClient = google.drive({version: 'v3', auth: oauth2Client});
    console.log('Step 5: Setting up Drive watch...'); // NEW LOG
    await setupDriveWatch();
    console.log('Step 6: Drive watch setup complete.'); // NEW LOG

    res.status(200).send('Authentication successful! Drive watch initiated. You can close this tab.');
  } catch (error) {
    console.error('CRITICAL ERROR during OAuth callback:', error); // NEW LOG
    // Provide a more detailed error response
    res.status(500).send(`Authentication failed: ${error.code} ${error.message}`);
  }
});

// --- Google Drive Watch Setup ---
// This function sets up push notifications (webhooks) for your Google Drive folder.
async function setupDriveWatch() {
  try {
    const tokens = await getTokens();
    if (!tokens) {
      console.error('No tokens found. Please complete OAuth authentication first.');
      throw new Error('Authentication required.');
    }
    oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI,
    );
    oauth2Client.setCredentials(tokens);

    driveClient = google.drive({version: 'v3', auth: oauth2Client});

    // Get the current startPageToken to track future changes
    const startPageTokenRes = await driveClient.changes.getStartPageToken();
    const currentStartPageToken = startPageTokenRes.data.startPageToken;
    console.log('Current startPageToken from Drive:', currentStartPageToken);

    // Update the stored startPageToken in appDataFolder
    await updateStartPageToken(currentStartPageToken);

    // Set up the watch channel for changes in the specified folder
    const channelId = `blog-channel-${Date.now()}`; // Corrected to Date.now()
    // The webhook URL is the base URL of your Cloud Function + /webhook
    const webhookUrl = process.env.GOOGLE_REDIRECT_URI.replace('/oauth2callback', '/webhook');

    console.log(`Setting up watch on folder ${process.env.GOOGLE_DRIVE_FOLDER_ID} with webhook ${webhookUrl}`);

    const watchRes = await driveClient.changes.watch({
      pageToken: currentStartPageToken,
      resource: {
        id: channelId,
        type: 'web_hook',
        address: webhookUrl,
      },
    });
    console.log('Drive watch setup successful! Response:', watchRes.data);
  } catch (error) {
    console.error('Error setting up Drive watch:', error);
    throw error;
  }
}

// --- Google Drive Webhook Listener ---
// This function is triggered by Google Drive push notifications.
app.post('/webhook', async (req, res) => {
  console.log('Received Drive webhook notification:', req.headers);

  // Respond immediately to the webhook to avoid timeouts
  res.status(200).send('OK');

  // Process the change asynchronously
  try {
    const tokens = await getTokens();
    if (!tokens) {
      console.error('No tokens found for webhook processing. Authentication required.');
      return;
    }
    oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI,
    );
    oauth2Client.setCredentials(tokens);

    driveClient = google.drive({version: 'v3', auth: oauth2Client});

    const lastStartPageToken = await getStartPageToken();

    if (!lastStartPageToken) {
      console.error('No startPageToken found. Cannot process changes.');
      // Attempt to re-setup watch if token is missing
      await setupDriveWatch();
      return;
    }

    // Fetch changes from the last known token
    const changesRes = await driveClient.changes.list({
      pageToken: lastStartPageToken,
      spaces: 'drive',
      fields: 'nextPageToken, newStartPageToken, changes(fileId, file(name, mimeType, parents))',
    });

    const changes = changesRes.data.changes;
    const newStartPageToken = changesRes.data.newStartPageToken;

    console.log(`Found ${changes.length} changes.`);

    for (const change of changes) {
      const file = change.file;

      // Check if it's a Google Doc and within our target folder
      const isGoogleDoc = file && file.mimeType === 'application/vnd.google-apps.document';
      const isInTargetFolder = file && file.parents && file.parents.includes(process.env.GOOGLE_DRIVE_FOLDER_ID);

      if (isGoogleDoc && isInTargetFolder) {
        console.log(`Processing Google Doc: ${file.name} (ID: ${change.fileId})`);
        try {
          // Export Google Doc as HTML
          const docRes = await driveClient.files.export({
            fileId: change.fileId,
            mimeType: 'text/html',
          }, {responseType: 'stream'});


          let htmlContent = '';
          for await (const chunk of docRes.data) {
            htmlContent += chunk.toString();
          }

          const cleanedHtml = cleanHtml(htmlContent);
          const title = file.name; // Use file name as title
          const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, ''); // Simple slug generation

          // Save to Firestore
          const blogPostRef = db.collection('posts').doc(change.fileId); // Use Drive file ID as Firestore doc ID
          await blogPostRef.set({
            title: title,
            slug: slug,
            htmlContent: cleanedHtml,
            publishDate: admin.firestore.FieldValue.serverTimestamp(),
            driveFileId: change.fileId,
            status: 'published', // Or 'draft' if you want a review process
          }, {merge: true}); // Use merge to update if already exists

          console.log(`Blog post "${title}" saved/updated in Firestore.`);
        } catch (docError) {
          console.error(`Error processing Google Doc ${file.name}:`, docError);
        }
      }
    }

    // Update the startPageToken for the next run
    if (newStartPageToken) {
      await updateStartPageToken(newStartPageToken);
    } else {
      console.warn('newStartPageToken was null, not updating token.');
    }
  } catch (error) {
    console.error('Error in webhook processing:', error);
  }
});

// --- API Endpoints for Frontend ---
// Fetch all published blog posts
app.get('/api/posts', async (req, res) => {
  try {
    const postsRef = db.collection('posts').where('status', '==', 'published').orderBy('publishDate', 'desc');
    const snapshot = await postsRef.get();
    const posts = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        title: data.title,
        slug: data.slug,
        // Create a snippet from the HTML content
        snippet: data.htmlContent ? data.htmlContent.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        publishDate: data.publishDate ? data.publishDate.toDate().toLocaleDateString() : 'N/A',
      });
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send('Error fetching posts.');
  }
});

// Fetch a single blog post by slug
app.get('/api/posts/:slug', async (req, res) => {
  const {slug} = req.params;
  try {
    const postsRef = db.collection('posts').where('slug', '==', slug).limit(1);
    const snapshot = await postsRef.get();

    if (snapshot.empty) {
      return res.status(404).send('Post not found.');
    }

    const post = snapshot.docs[0].data();
    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching single post:', error);
    res.status(500).send('Error fetching post.');
  }
});

// Export the Express app as a Cloud Function
// This makes all routes defined on `app` available as HTTP endpoints.
exports.googleDriveWebhook = onRequest({region: 'asia-south1'}, app);

exports.scheduledCheck = onSchedule(
    {
      schedule: '0 7 * * *',
      region: 'asia-south1',
      timeZone: 'Asia/Kolkata',
    },
    async (event) => {
      console.log('Running daily scheduled task to re-establish Drive watch...');
      try {
        await setupDriveWatch();
        console.log('Drive watch successfully re-initialized.');
      } catch (error) {
        console.error('Scheduled setupDriveWatch failed:', error.message);
      }
    },
);
