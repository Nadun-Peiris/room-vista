"use client";

import { useState } from "react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { question: "How long does shipping take?", answer: "All our pieces are made to order. Standard delivery takes between 4-6 weeks from the date of purchase. You will receive tracking information once your item is ready to ship." },
    { question: "Can I use the 3D Planner as a standard customer?", answer: "Currently, the full Room Vista 3D Editor is reserved for our verified design partners. However, we are working on a simplified AR viewer for all customers soon." },
    { question: "What is your return policy?", answer: "We accept returns within 30 days of delivery. Items must be in their original condition. Please note that custom-upholstered items are final sale and cannot be returned." },
    { question: "Do you offer fabric swatches?", answer: "Yes! We encourage ordering fabric and wood swatches before making a final decision. You can request up to 5 free swatches via our contact page." },
    { question: "Are your materials sustainably sourced?", answer: "Absolutely. We strictly partner with FSC-certified lumber mills and utilize fabrics woven from recycled or natural, low-impact fibers." },
  ];

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-emerald-100 rounded-full blur-[150px] opacity-50 pointer-events-none" />
      
      <main className="relative z-10 pt-32 pb-24 px-6 md:px-10 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            Everything you need to know about our products and services.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl overflow-hidden transition-all duration-300 ${openIndex === index ? "shadow-md" : "shadow-sm hover:shadow"}`}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 text-left flex justify-between items-center focus:outline-none"
              >
                <span className="text-lg font-bold text-gray-900">{faq.question}</span>
                <span className={`transform transition-transform duration-300 text-emerald-600 ${openIndex === index ? "rotate-180" : ""}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </button>
              <div 
                className={`px-8 overflow-hidden transition-all duration-300 ${openIndex === index ? "max-h-40 pb-6 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <p className="text-gray-600 font-medium leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}
