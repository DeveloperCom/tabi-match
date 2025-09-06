import React from 'react';
import Link from 'next/link';
import { Share2 } from 'lucide-react';

const handleShare = async () => {
  const shareData = {
    title: document.title,
    text: 'Check out this awesome site!',
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      console.log(shareData)
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
    } else {
      // Last fallback
      prompt('Copy this link:', shareData.url);
    }
  } catch (error) {
    console.error('Sharing failed:', error);
    alert('Sharing failed, please try manually.');
  }
};

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-[2px] bg-gray-950/50 px-6 py-4 flex justify-between items-center shadow-md">
      {/* Logo */}
      <Link href="/">
        <img
          src="https://www.tabichain.com/images/new2/logo.svg"
          alt="Logo"
          className="h-10 w-auto"
        />
      </Link>

      {/* Share Button */}
      <button className="bg-red-500 text-white px-5 py-2 rounded-md hover:bg-red-600 transition flex gap-1" onClick={handleShare}>
        <Share2 className='p-1' /> Share
      </button>
    </nav>
  );
};

export default Navbar;
