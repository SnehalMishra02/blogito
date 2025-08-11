import { Rss, FileText, Zap, MonitorSmartphone, Github, Linkedin, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// A small component for displaying tech stack icons.
// You could replace the text with actual SVG logos for a nicer look.
const TechIcon = ({ name }: { name: string }) => (
  <div className="flex items-center justify-center p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
    <span className="font-semibold text-slate-700">{name}</span>
  </div>
);

export default function AboutPage() {
  return (
    <div className="bg-slate-50 text-slate-800 font-sans">
      {/* Hero Section */}
      <section className="text-center py-20 sm:py-24 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            About Blogito
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600">
            Blogito is a minimalist blogging platform that connects directly to your Google Drive, turning documents into beautifully styled posts automatically.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Explore Posts
            </Link>
            <a href="https://github.com/SnehalMishra02/blogito" target="_blank" rel="noopener noreferrer" className="bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-colors">
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              The Magic of Automation
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-slate-600">
              Focus on writing, not on managing a clunky CMS. Here’s the simple, three-step workflow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex justify-center items-center mx-auto bg-blue-100 rounded-full w-16 h-16">
                <FileText className="text-blue-600" size={32} />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">1. Write in Google Docs</h3>
              <p className="mt-2 text-slate-600">
                Create and edit your posts in the familiar comfort of Google Docs.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex justify-center items-center mx-auto bg-blue-100 rounded-full w-16 h-16">
                <Zap className="text-blue-600" size={32} />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">2. Automation Kicks In</h3>
              <p className="mt-2 text-slate-600">
                A secure backend function detects changes, converts your doc to HTML, and stores it.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex justify-center items-center mx-auto bg-blue-100 rounded-full w-16 h-16">
                <MonitorSmartphone className="text-blue-600" size={32} />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">3. Published Instantly</h3>
              <p className="mt-2 text-slate-600">
                Your post appears here, perfectly formatted and ready for your audience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 sm:py-24 bg-white border-t border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Powered by Modern Tech
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-slate-600">
              This project was built with a modern, serverless technology stack.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-4xl mx-auto">
            <TechIcon name="Next.js" />
            <TechIcon name="React" />
            <TechIcon name="Tailwind CSS" />
            <TechIcon name="Google Cloud" />
            <TechIcon name="Firestore" />
            <TechIcon name="Node.js" />
          </div>
        </div>
      </section>

      {/* About the Creator Section */}
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="flex-shrink-0">
                <Image
                    src="/me.jpeg" // <-- Step 2: Path from the 'public' folder
                    alt="A photo of yours truly"
                    width={500}   // <-- Step 3: Use the actual width of your image
                    height={500}  // <-- Step 3: Use the actual height of your image
                    className="w-40 h-40 rounded-full object-cover" // Added object-cover to prevent stretching
                />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">About the Creator</h2>
              <p className="mt-4 text-slate-600">
                Hi, I'm Snehal. I'm a passionate developer who loves building elegant solutions to interesting problems. Blogito is my personal project to explore serverless architecture and automated content workflows.
              </p>
              <div className="mt-6 flex items-center gap-6">
                <a href="https://www.linkedin.com/in/snehal-mishra-2618b2199" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors">
                  <Linkedin size={24} />
                </a>
                <a href="https://github.com/SnehalMishra02" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors">
                  <Github size={24} />
                </a>
                <a href="https://snehal-mishra.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors">
                  <LinkIcon size={24} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}