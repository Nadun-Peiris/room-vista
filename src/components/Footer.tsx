import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-white border-t border-gray-100 pt-16 pb-8 px-6 md:px-10">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        
        {/* Centered Logo */}
        <Link href="/" className="mb-8">
          <img 
            src="/logo-horizontal.png" 
            alt="Room Vista Logo" 
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Centered Horizontal Menu */}
        <nav className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 mb-12">
          <Link href="/catalog" className="text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors uppercase tracking-widest">
            Catalog
          </Link>
          <Link href="/about" className="text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors uppercase tracking-widest">
            About Us
          </Link>
          <Link href="/contact" className="text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors uppercase tracking-widest">
            Contact Us
          </Link>
          <Link href="/faq" className="text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors uppercase tracking-widest">
            FAQ
          </Link>
          <Link href="/terms" className="text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors uppercase tracking-widest">
            Terms & Policy
          </Link>
        </nav>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-100 w-full">
          <p className="text-sm font-medium text-gray-400">
            © {new Date().getFullYear()} Room Vista Furniture. All rights reserved.
          </p>
        </div>
        
      </div>
    </footer>
  );
}
