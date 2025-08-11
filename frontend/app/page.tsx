import Link from 'next/link';
import { Rss } from 'lucide-react'; // A nice icon for our logo
import Footer from './footer/footer';

// The BlogPost interface remains the same
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  snippet: string;
  publishDate: string;
}

// The getPosts function remains the same
async function getPosts(): Promise<BlogPost[]> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    console.error('Backend URL is not configured.');
    return [];
  }
  try {
    const res = await fetch(`${backendUrl}/api/posts`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.error(`Failed to fetch posts, status: ${res.status}`);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

// The main homepage component with new branding
export default async function HomePage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Rss className="text-white" size={24} />
            </div>
            <Link href='\' className="text-2xl font-bold text-slate-900 tracking-tight">
              Blogito
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/about"
              className="hidden sm:block bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              About
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Recent Posts
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
            Thoughts, stories, and ideas, synced directly from my workspace.
          </p>
        </div>

        {/* Blog Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Link href={`/posts/${post.slug}`} key={post.id} className="block group">
                <div className="bg-white rounded-xl shadow-md h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                  <div className="p-6 flex-grow flex flex-col">
                    <p className="text-sm text-slate-500 mb-2">
                      {post.publishDate}
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 flex-grow line-clamp-4">
                      {post.snippet}
                    </p>
                  </div>
                  <div className="p-6 bg-slate-50/50 mt-auto">
                    <span className="text-blue-600 font-semibold">Read More &rarr;</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="col-span-full text-center text-slate-500 text-lg">
              No posts found. Try creating a new Google Doc in your blog folder!
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}