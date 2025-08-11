import React from 'react';
import Link from 'next/link';

// Define the props for the component if any are needed in the future.
// For now, it doesn't take any props.
interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
    // Placeholder links - replace these with your actual URLs
    const portfolioUrl = "https://snehal-mishra.vercel.app/";
    const linkedinUrl = "https://www.linkedin.com/in/snehal-mishra-2618b2199";
    const githubUrl = "https://github.com/SnehalMishra02";

    return (
        // The main footer container.
        // Assumes Tailwind CSS is configured in your Next.js project.
        <footer className="w-full bg-white shadow-t rounded-t-lg mt-auto">
            <div className="container mx-auto py-6 px-4">
                <div className="flex flex-col items-center justify-center">
                    {/* Main Text with a link to your personal site */}
                    <p className="text-gray-600 text-center text-lg mb-4">
                        Made with <span className="text-red-500">❤️</span> by{' '}
                        <Link href={portfolioUrl} legacyBehavior>
                            <a target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-300">
                                Snehal
                            </a>
                        </Link>
                    </p>

                    {/* Social Media Icons Container */}
                    <div className="flex items-center space-x-6">
                        {/* Portfolio Link */}
                        <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600 transition-colors duration-300" aria-label="Portfolio Website">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path clipRule="evenodd" fillRule="evenodd" d="M8.25 3.75H19.5a.75.75 0 0 1 .75.75v11.25a.75.75 0 0 1-1.5 0V6.31L5.03 20.03a.75.75 0 0 1-1.06-1.06L17.69 5.25H9a.75.75 0 0 1 0-1.5Z"></path>
                            </svg>
                        </a>

                        {/* LinkedIn Link */}
                        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-700 transition-colors duration-300" aria-label="LinkedIn Profile">
                           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2ZM8 19H5v-9h3v9Zm-1.5-10.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5ZM19 19h-3v-4.75c0-1.4-.5-2.5-1.8-2.5-1 0-1.5.7-1.7 1.4-.1.2-.1.5-.1.8V19h-3v-9h3v1.25c.4-.75 1.4-1.5 2.8-1.5 2 0 3.5 1.25 3.5 4.25V19Z"></path>
                            </svg>
                        </a>

                        {/* GitHub Link */}
                        <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors duration-300" aria-label="GitHub Profile">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                               <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.492.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0 0 22 12c0-5.523-4.477-10-10-10Z" clipRule="evenodd" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
