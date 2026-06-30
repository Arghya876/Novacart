import React from 'react';
import { Mail, Phone, MapPin, HelpCircle } from 'lucide-react';

export function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 space-y-6 text-center">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">About NovaCart</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
        NovaCart is a next-generation e-commerce platform built on the principles of speed, security, and premium aesthetics. Inspired by the scale of giants like Amazon and the curated experience of the Apple Store, we offer a seamless bridge between sellers and customers.
      </p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
        Our mission is to empower independent brands and merchants while providing shoppers with an unmatched, highly animated, and fully responsive digital storefront.
      </p>
    </div>
  );
}

export function Contact() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Contact Us</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Have questions about your order, shipping, or selling on NovaCart? Get in touch with our team.
        </p>

        <div className="space-y-4 text-xs text-neutral-600 dark:text-neutral-350">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-violet-600" />
            <span>support@novacart.com</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-violet-600" />
            <span>+1 (555) 019-2834</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-violet-600" />
            <span>100 E-Commerce Way, Suite 400, New York, NY 10001</span>
          </div>
        </div>
      </div>

      <form className="p-6 border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 rounded-3xl space-y-4 shadow-sm text-xs">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 uppercase">Your Name</label>
          <input type="text" required className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 uppercase">Email Address</label>
          <input type="email" required className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 uppercase">Message</label>
          <textarea rows={4} required className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950" />
        </div>
        <button type="submit" className="w-full h-11 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-sm">
          Send Message
        </button>
      </form>
    </div>
  );
}

export function FAQ() {
  const faqs = [
    { q: 'How long does shipping take?', a: 'Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business days delivery.' },
    { q: 'Can I sell my products on NovaCart?', a: 'Yes! You can register as a seller from the registration page. Once approved, you can list products from your seller portal.' },
    { q: 'Is my payment secure?', a: 'Absolutely. We use industry-standard Stripe and Razorpay integrations with 256-bit encryption for all transactions.' },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 space-y-8">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white text-center">Frequently Asked Questions</h1>
      <div className="space-y-6">
        {faqs.map((faq, i) => (
          <div key={i} className="p-6 border border-neutral-100 dark:border-neutral-850 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-neutral-850 dark:text-neutral-200 flex items-center gap-2">
              <HelpCircle className="h-4.5 w-4.5 text-violet-600 flex-shrink-0" /> {faq.q}
            </h3>
            <p className="text-xs text-neutral-450 dark:text-neutral-400 leading-relaxed pl-6">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Privacy Policy</h1>
      <p className="text-xs text-neutral-450 leading-relaxed">
        At NovaCart, we value your privacy. We collect personal information such as name, email address, and shipping address solely to process your orders and enhance your shopping experience. We never sell your data to third parties. All payment information is processed securely through Stripe/Razorpay and is not stored on our servers.
      </p>
    </div>
  );
}

export function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Terms of Service</h1>
      <p className="text-xs text-neutral-450 leading-relaxed">
        By using NovaCart, you agree to comply with our terms of service. Sellers are responsible for the accuracy of their product listings and inventory levels. NovaCart reserves the right to terminate accounts that violate our community guidelines or engage in fraudulent activities.
      </p>
    </div>
  );
}
