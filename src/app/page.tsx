"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Mock data for the catalog using Unsplash images
  const catalogPieces = [
    { 
      id: 1, 
      name: "The Cloud Sofa", 
      category: "Seating", 
      material: "Linen Blend", 
      dimensions: "84\"W x 36\"D x 34\"H",
      description: "Sink into unparalleled comfort. The Cloud Sofa features deep seating and plush, down-filled cushions, perfect for modern living spaces.",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      id: 2, 
      name: "Oak Dining Table", 
      category: "Tables", 
      material: "Solid White Oak", 
      dimensions: "72\"W x 36\"D x 30\"H",
      description: "Crafted from sustainably sourced solid white oak, this minimalist dining table seats six comfortably and features a durable matte finish.",
      image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      id: 3, 
      name: "Minimalist Lounge Chair", 
      category: "Seating", 
      material: "Ash Wood & Leather", 
      dimensions: "28\"W x 32\"D x 30\"H",
      description: "A mid-century inspired accent piece. Features a sculpted ash wood frame with premium top-grain leather upholstery.",
      image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800" 
    },
    { 
      id: 4, 
      name: "Walnut Media Console", 
      category: "Storage", 
      material: "American Walnut", 
      dimensions: "60\"W x 18\"D x 24\"H",
      description: "Keep your entertainment area clean and stylish. Includes wire management cutouts and soft-close cabinet doors.",
      image: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=800" 
    },
  ];

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden font-sans selection:bg-emerald-200 selection:text-emerald-900 scroll-smooth">
      
      {/* Ambient Lighting Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-emerald-100 rounded-full blur-[150px] opacity-50 pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-blue-100 rounded-full blur-[150px] opacity-50 pointer-events-none" />

      <main className="relative z-10">
        
        {/* HERO SECTION */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-6 md:px-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
              Curated furniture for <br className="hidden lg:block"/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-400">
                modern living.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-medium max-w-xl mx-auto md:mx-0 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Discover sustainably crafted pieces designed to elevate your home. Preview every item in your exact space using our proprietary 3D rendering engine.
            </p>
          </div>

          <div className="flex-1 w-full animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <div className="bg-white/70 border border-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.08)] p-4 relative">
              <img 
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200" 
                alt="Modern Living Room" 
                className="w-full h-[400px] md:h-[500px] object-cover rounded-3xl"
              />
              <div className="absolute bottom-10 left-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden">
                   <img 
                     src="https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=200" 
                     alt="Minimalist Lounge Chair" 
                     className="w-full h-full object-cover" 
                   />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Featured Piece</p>
                  <p className="font-extrabold text-gray-900">Minimalist Lounge</p>
                  <p className="text-emerald-600 font-bold text-xs uppercase tracking-wider">Signature Collection</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-24 px-6 md:px-10 bg-white/40 border-t border-white/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Uncompromising Quality</h2>
              <p className="text-gray-500 font-medium max-w-2xl mx-auto">Every piece in our catalog is built with intention, ensuring it not only looks beautiful but stands the test of time.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/80 border border-gray-100 rounded-[2rem] p-8 shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Sustainably Sourced</h3>
                <p className="text-gray-500 font-medium leading-relaxed">We partner with ethical mills and forests to ensure every piece of wood and fabric respects the environment.</p>
              </div>
              <div className="bg-white/80 border border-gray-100 rounded-[2rem] p-8 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Master Craftsmanship</h3>
                <p className="text-gray-500 font-medium leading-relaxed">Designed by experts and assembled by hand. Our furniture features precision joinery and premium finishes.</p>
              </div>
              <div className="bg-white/80 border border-gray-100 rounded-[2rem] p-8 shadow-sm">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 text-amber-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Lifetime Durability</h3>
                <p className="text-gray-500 font-medium leading-relaxed">Built for living, not just looking. Our materials are rigorously tested for daily wear and tear.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CATALOG GRID */}
        <section id="catalog" className="py-24 px-6 md:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 flex items-start justify-between gap-6 flex-wrap">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">The Catalog</h2>
                <p className="text-gray-500 font-medium">Explore the craftsmanship of our latest additions.</p>
              </div>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                Browse Categories
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {catalogPieces.map((product) => (
                <div key={product.id} className="group flex flex-col cursor-pointer" onClick={() => setSelectedProduct(product)}>
                  <div className="w-full aspect-square bg-white border border-gray-100 rounded-3xl overflow-hidden mb-4 relative shadow-sm group-hover:shadow-xl transition-all duration-300">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                      <button className="w-full bg-white/90 backdrop-blur-md text-gray-900 font-bold py-3 rounded-xl shadow-lg hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        View Details
                      </button>
                    </div>
                  </div>
                  <div className="px-2 flex flex-col items-start">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{product.category}</p>
                    <h3 className="font-extrabold text-gray-900 text-lg">{product.name}</h3>
                    <p className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs mt-2">{product.material}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COLLECTIONS SECTION */}
        <section id="collections" className="py-24 px-6 md:px-10 bg-white/40 border-t border-b border-white/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 w-full">
               <div className="aspect-[4/5] md:aspect-square rounded-[3rem] overflow-hidden shadow-2xl relative">
                  <img 
                    src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200" 
                    alt="Autumn Collection" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent flex items-end p-10">
                     <p className="text-white font-extrabold text-2xl">The Artisan Collection</p>
                  </div>
               </div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">Designed for harmony.</h2>
              <p className="text-gray-500 font-medium text-lg leading-relaxed mb-8">
                Our collections are thoughtfully curated to bring balance and warmth into any room. By pairing organic textures with clean, modern lines, we create spaces that feel both elevated and deeply comfortable.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-700 font-bold">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg></div>
                  Cohesive color palettes
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-bold">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg></div>
                  Matching wood grains and finishes
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-bold">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg></div>
                  Modular adaptability
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* OUR STORY SECTION */}
        <section id="about" className="py-24 px-6 md:px-10 max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4">Our Story</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-8">Rooted in design, built for life.</h2>
            <p className="text-gray-500 font-medium text-lg leading-relaxed mb-12">
              Room Vista was founded by a collective of interior designers and architects who were frustrated by the disconnect between beautiful showrooms and the reality of fitting furniture into everyday homes. We set out to build a brand where aesthetic perfection meets spatial intelligence.
            </p>
          </div>
          <div className="w-full h-[400px] rounded-[3rem] overflow-hidden shadow-lg border border-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200" 
              alt="Design Studio" 
              className="w-full h-full object-cover" 
            />
          </div>
        </section>

        {/* CONTACT / DESIGNER BRIDGE */}
        <section id="contact" className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
          <div className="bg-gray-900 rounded-[3rem] p-10 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/30 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 flex-1">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
                Try it in your room before you decide.
              </h2>
              <p className="text-gray-400 font-medium text-lg leading-relaxed max-w-lg mb-8">
                Bridge the gap between imagination and reality. Our integrated Room Vista Editor lets you drop pieces from our catalog directly into a 3D model of your exact room dimensions. 
                <br /><br />
                Available exclusively for our design partners.
              </p>
              
              <Link 
                href="/contact" 
                className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                Contact Us to Partner
              </Link>
            </div>

            <div className="relative z-10 flex-1 w-full max-w-md">
              <div className="aspect-square bg-gray-800 rounded-3xl border border-gray-700 shadow-2xl p-6 flex flex-col justify-between">
                 <div className="w-full h-8 flex justify-between items-center border-b border-gray-700 pb-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">Room Vista Engine</span>
                 </div>
                 <div className="flex-1 flex items-center justify-center relative">
                    <div className="w-32 h-32 bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl shadow-xl transform rotate-12 absolute z-20"></div>
                    <div className="w-32 h-32 bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md rounded-2xl shadow-xl transform -rotate-12 absolute z-10 -translate-x-8 translate-y-8"></div>
                 </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" 
            onClick={() => setSelectedProduct(null)} 
          />
          
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/90 border border-white backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 duration-200 scrollbar-hide flex flex-col md:flex-row">
            
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="absolute top-4 right-4 z-10 p-2 bg-white/50 backdrop-blur-md hover:bg-gray-100 text-gray-600 rounded-full transition-colors md:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="md:w-1/2 p-4 md:p-6">
               <div className="w-full h-64 md:h-full min-h-[300px] rounded-[2rem] overflow-hidden bg-gray-100">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover"
                  />
               </div>
            </div>

            <div className="md:w-1/2 p-8 md:p-12 flex flex-col relative">
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="hidden md:block absolute top-8 right-8 p-2 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">{selectedProduct.category}</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">{selectedProduct.name}</h2>
              
              <p className="text-gray-600 font-medium leading-relaxed mb-8 flex-1">
                {selectedProduct.description}
              </p>

              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                   <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Material</span>
                   <span className="text-sm font-bold text-gray-900 text-right">{selectedProduct.material}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Dimensions</span>
                   <span className="text-sm font-bold text-gray-900 text-right">{selectedProduct.dimensions}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
