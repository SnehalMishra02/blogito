import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from './post.module.css';
import { extractColorsFromHtml } from './utils';

interface BlogPostContent {
  title: string;
  slug: string;
  htmlContent: string;
  publishDate: { _seconds: number };
}

async function getPostBySlug(slug: string): Promise<BlogPostContent | null> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) return null;

  try {
    const res = await fetch(`${backendUrl}/api/posts/${slug}`, {
      next: { revalidate: 60 },
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch post, status: ${res.status}`);

    const data = await res.json();
    // console.log('API Response:', data);
    // console.log('HTML Content:', data.htmlContent);
    return data;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  return {
    title: post ? `${post.title} | Blogito` : 'Post Not Found',
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const publishDate = new Date(post.publishDate._seconds * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const { backgroundColor, textColor, primaryColor } = extractColorsFromHtml(post.htmlContent);


  return (
    <div 
      className={styles.postContent}
      style={{ backgroundColor, color: textColor }}
    >
      <main className="container mx-auto px-4 py-6 sm:py-1">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 transition-colors mt-6 mb-6 group"
            style={{ color: primaryColor }}
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Posts</span>
          </Link>

          {/* Post Header */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: primaryColor }}>
              {post.title}
            </h1>
            <p className="mt-4" style={{ color: primaryColor }}>
              Published on {publishDate}
            </p>
          </div>

          {/* Post Content */}
          <div
            className={styles.docContent}
            dangerouslySetInnerHTML={{ __html: post.htmlContent }}
          ></div>
        </div>
      </main>
    </div>
  );
}
