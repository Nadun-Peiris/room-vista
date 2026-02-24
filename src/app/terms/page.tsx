export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <div className="absolute top-[10%] left-[-10%] w-[800px] h-[800px] bg-blue-100 rounded-full blur-[150px] opacity-30 pointer-events-none" />

      <main className="relative z-10 pt-32 pb-24 px-6 md:px-10 max-w-4xl mx-auto">
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[3rem] p-10 md:p-16 shadow-sm">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Terms & Privacy Policy</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-12">Last Updated: October 2023</p>

          <div className="prose prose-gray max-w-none text-gray-600 font-medium space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                Welcome to Room Vista. These Terms of Service and Privacy Policy govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms. If you do not agree with any part of these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Privacy & Data Collection</h2>
              <p className="leading-relaxed">
                We are committed to protecting your personal information. We collect data necessary to fulfill your orders, provide access to the 3D Designer portal, and improve our services. We will never sell your personal data to third-party marketers. For more information on how your data is encrypted and stored, please contact our support team.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Use of the 3D Designer Tool</h2>
              <p className="leading-relaxed">
                Access to the Room Vista 3D Editor is granted exclusively to verified design partners. Intellectual property created within the tool remains the property of the creator, however, Room Vista retains the rights to the software infrastructure, 3D models, and catalog assets provided within the tool.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Orders and Fulfillment</h2>
              <p className="leading-relaxed">
                All physical furniture items are subject to availability and production lead times. We reserve the right to refuse or cancel orders at any time due to stock issues or suspected fraudulent activity. Prices are subject to change without prior notice.
              </p>
            </section>
          </div>
        </div>
      </main>

    </div>
  );
}
