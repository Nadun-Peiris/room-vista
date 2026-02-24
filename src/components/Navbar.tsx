"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const stickyRoutes = ["/", "/catalog", "/about", "/contact", "/faq", "/terms"];
  const isStickyPage = stickyRoutes.includes(pathname);
  const isHomePage = pathname === "/";
  const catalogHref = isHomePage ? "#catalog" : "/#catalog";
  const collectionsHref = isHomePage ? "#collections" : "/#collections";
  const featuresHref = isHomePage ? "#features" : "/#features";
  const aboutHref = isHomePage ? "#about" : "/#about";
  const contactHref = isHomePage ? "#contact" : "/#contact";

  useEffect(() => {
    if (!isStickyPage) {
      setScrolled(false);
      return;
    }

    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isStickyPage]);

  return (
    <nav
      className={`transition-all duration-300 ${
        isStickyPage
          ? `fixed top-0 left-0 right-0 z-50 ${
              scrolled
                ? "bg-white/80 backdrop-blur-md border-b border-white/50 shadow-sm py-4"
                : "bg-transparent py-6"
            }`
          : "relative z-40 bg-white border-b border-gray-100 shadow-sm py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between relative">
        
        {/* Left: Customer Logo */}
        <div className="flex w-1/4 justify-start">
          <Link href="/" className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
            <img 
              src="/logo-horizontal.png" 
              alt="Room Vista Logo" 
              className="h-8 md:h-10 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Center: 5 Nav Links */}
        <div className="hidden lg:flex flex-1 justify-center items-center gap-8">
          <Link href="/catalog" className="text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors">Catalog</Link>
          <Link href={collectionsHref} className="text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors">Collections</Link>
          <Link href={featuresHref} className="text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors">Features</Link>
          <Link href={aboutHref} className="text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors">Our Story</Link>
          <Link href="contact" className="text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors">Contact</Link>
        </div>

        {/* Right: Actions */}
        <div className="flex w-1/4 justify-end items-center gap-4">
          <Link 
            href="/login" 
            className="hidden sm:flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors bg-emerald-50 border border-emerald-200 px-5 py-2.5 rounded-full shadow-sm hover:shadow hover:bg-emerald-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
            For Designers
          </Link>
        </div>

      </div>
    </nav>
  );
}
