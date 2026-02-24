"use client";

import { useState } from "react";

export default function CatalogPage() {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Expanded mock data
  const catalogPieces = [
    { id: 1, name: "The Cloud Sofa", category: "Seating", material: "Linen Blend", dimensions: "84\"W x 36\"D x 34\"H", description: "Sink into unparalleled comfort. The Cloud Sofa features deep seating and plush, down-filled cushions.", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800" },
    { id: 2, name: "Oak Dining Table", category: "Tables", material: "Solid White Oak", dimensions: "72\"W x 36\"D x 30\"H", description: "Crafted from sustainably sourced solid white oak, this minimalist dining table seats six comfortably.", image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=800" },
    { id: 3, name: "Minimalist Lounge Chair", category: "Seating", material: "Ash Wood & Leather", dimensions: "28\"W x 32\"D x 30\"H", description: "A mid-century inspired accent piece. Features a sculpted ash wood frame with premium top-grain leather.", image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800" },
    { id: 4, name: "Walnut Media Console", category: "Storage", material: "American Walnut", dimensions: "60\"W x 18\"D x 24\"H", description: "Keep your entertainment area clean and stylish. Includes wire management cutouts and soft-close doors.", image: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=800" },
    { id: 5, name: "Bouclé Accent Chair", category: "Seating", material: "Textured Bouclé", dimensions: "30\"W x 30\"D x 28\"H", description: "Soft, textured, and inviting. This accent chair brings warmth and a modern silhouette to any room.", image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800" },
    { id: 6, name: "Marble Coffee Table", category: "Tables", material: "Carrara Marble & Steel", dimensions: "40\"W x 40\"D x 16\"H", description: "A striking centerpiece featuring a genuine Carrara marble top resting on a minimalist blackened steel frame.", image: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=800" },
  ];

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-emerald-100 rounded-full blur-[150px] opacity-50 pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-blue-100 rounded-full blur-[150px] opacity-50 pointer-events-none" />

      <main className="relative z-10 pt-32 pb-24 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
            The Full Collection
          </h1>
          <p className="text-lg text-gray-500 font-medium animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Browse our entire range of sustainably crafted, beautifully designed pieces for modern living.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {catalogPieces.map((product) => (
            <div key={product.id} className="group flex flex-col cursor-pointer animate-in fade-in zoom-in-95 duration-1000" onClick={() => setSelectedProduct(product)}>
              <div className="w-full aspect-square bg-white border border-gray-100 rounded-3xl overflow-hidden mb-4 relative shadow-sm group-hover:shadow-xl transition-all duration-300">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                  <button className="w-full bg-white/90 backdrop-blur-md text-gray-900 font-bold py-3 rounded-xl shadow-lg hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    View Details
                  </button>
                </div>
              </div>
              <div className="px-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{product.category}</p>
                <h3 className="font-extrabold text-gray-900 text-lg">{product.name}</h3>
                <p className="font-bold text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-lg text-xs mt-2">{product.material}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/90 border border-white backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 duration-200 scrollbar-hide flex flex-col md:flex-row">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-10 p-2 bg-white/50 backdrop-blur-md hover:bg-gray-100 text-gray-600 rounded-full transition-colors md:hidden">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="md:w-1/2 p-4 md:p-6">
               <div className="w-full h-64 md:h-full min-h-[300px] rounded-[2rem] overflow-hidden bg-gray-100">
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
               </div>
            </div>
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col relative">
              <button onClick={() => setSelectedProduct(null)} className="hidden md:block absolute top-8 right-8 p-2 text-gray-400 hover:text-gray-900 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">{selectedProduct.category}</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">{selectedProduct.name}</h2>
              <p className="text-gray-600 font-medium leading-relaxed mb-8 flex-1">{selectedProduct.description}</p>
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
