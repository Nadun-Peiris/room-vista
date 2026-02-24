"use client";

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent! We will get back to you shortly.");
  };

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-emerald-100 rounded-full blur-[150px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-blue-100 rounded-full blur-[150px] opacity-50 pointer-events-none" />

      <main className="relative z-10 pt-32 pb-24 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Let's start a conversation.
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            Whether you have a question about our catalog, need design assistance, or want to explore a partnership, we're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="lg:col-span-3 bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">First Name</label>
                  <input type="text" required className="w-full p-4 rounded-2xl bg-white border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm font-medium" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Last Name</label>
                  <input type="text" required className="w-full p-4 rounded-2xl bg-white border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm font-medium" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                <input type="email" required className="w-full p-4 rounded-2xl bg-white border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm font-medium" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Message</label>
                <textarea rows={5} required className="w-full p-4 rounded-2xl bg-white border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm font-medium resize-none"></textarea>
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-[2rem] p-8 shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-500 font-medium mb-4">Our friendly team is here to help.</p>
              <a href="mailto:hello@roomvista.com" className="text-emerald-600 font-bold hover:underline">hello@roomvista.com</a>
            </div>

            <div className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-[2rem] p-8 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Visit Our Studio</h3>
              <p className="text-gray-500 font-medium mb-4">Come say hello at our design headquarters.</p>
              <p className="text-gray-900 font-bold">100 Design Avenue<br/>Creative District, NY 10001</p>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
