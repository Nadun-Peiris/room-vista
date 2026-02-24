export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-emerald-100 rounded-full blur-[150px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-blue-100 rounded-full blur-[150px] opacity-50 pointer-events-none" />

      <main className="relative z-10 pt-32 pb-24 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4">Our Story</p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Redefining the way you design your space.
          </h1>
          <p className="text-lg text-gray-500 font-medium leading-relaxed">
            Founded by a collective of interior designers and technologists, Room Vista bridges the gap between beautiful showrooms and the reality of fitting furniture into everyday homes.
          </p>
        </div>

        <div className="w-full aspect-video rounded-[3rem] overflow-hidden shadow-2xl mb-20 relative">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" alt="Room Vista Studio" className="w-full h-full object-cover" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-5xl mx-auto">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-6">Our Mission</h2>
            <p className="text-gray-600 font-medium leading-relaxed mb-6">
              We believe that everyone deserves a space that feels uniquely theirs, designed with intention and crafted with quality. Our mission is to democratize high-end interior design by providing premium, sustainably sourced furniture alongside cutting-edge visualization tools.
            </p>
            <p className="text-gray-600 font-medium leading-relaxed">
              By giving our customers and design partners the ability to preview pieces in a 3D environment before making a decision, we eliminate the guesswork and buyer's remorse traditionally associated with furniture shopping.
            </p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">What We Stand For</h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Sustainable Craftsmanship</h4>
                  <p className="text-sm text-gray-500 font-medium mt-1">Ethically sourced materials designed to last generations.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Innovation in Design</h4>
                  <p className="text-sm text-gray-500 font-medium mt-1">Integrating 3D technology to revolutionize the buying experience.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/></svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Accessible Luxury</h4>
                  <p className="text-sm text-gray-500 font-medium mt-1">Premium aesthetics without the exclusionary markups.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>

    </div>
  );
}
