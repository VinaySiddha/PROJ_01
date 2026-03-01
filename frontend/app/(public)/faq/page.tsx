/**
 * @file FAQ page — questions pulled from admin-controlled site settings
 * @module app/(public)/faq/page
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FAQ — The Magic Screen',
  description:
    'Frequently asked questions about The Magic Screen private theater bookings, cancellations, pricing, and more.',
};

interface FaqItem {
  q: string;
  a: string;
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    q: 'What is a private theater?',
    a: 'A private theater is an exclusively booked screening room for just you and your guests. No other customers share the space. You get the full cinematic experience — 4K screen, surround sound, recliner seats — completely privately.',
  },
  {
    q: 'How many people can book?',
    a: 'Our theaters accommodate 2 to 20 people depending on the theater. The base price covers a set number of guests; additional guests can be added at an extra charge per person.',
  },
  {
    q: 'What is the advance payment?',
    a: 'We charge ₹700 as advance to confirm your booking. This includes ₹200 non-refundable processing fee and ₹500 refundable deposit. The remaining balance is paid at the venue on the day of your booking.',
  },
  {
    q: 'How do I pay?',
    a: 'We accept UPI payments (PhonePe, GPay, Paytm, etc.). After confirming your booking details, you\'ll scan a QR code or use our UPI ID to pay the advance, then enter your transaction reference to confirm.',
  },
  {
    q: 'Can I bring my own food?',
    a: 'Yes, outside food is fully allowed. We also offer food pre-ordering at checkout for your convenience — so your snacks are ready when you arrive.',
  },
  {
    q: 'What streaming platforms can I use?',
    a: "Any platform you're subscribed to — Netflix, Prime Video, Disney+, Hotstar, YouTube, and more. Just bring your login credentials. We also support HDMI input from your own laptop.",
  },
  {
    q: 'Can I bring a cake?',
    a: "Yes, you're welcome to bring your own cake. We also offer cake options via our add-ons menu if you'd prefer us to arrange it.",
  },
  {
    q: 'What is the cancellation policy?',
    a: "Free cancellation up to 72 hours before your slot. You'll receive ₹500 refund within 7 business days. Cancellations within 72 hours forfeit the full ₹700 advance.",
  },
  {
    q: 'How do I track my booking?',
    a: 'After completing your booking you\'ll receive a Booking ID. Visit the "Track Booking" page on our website and enter your Booking ID to see the status of your reservation.',
  },
  {
    q: 'Are there couple-only theaters?',
    a: 'Yes, our Red Love theater is reserved exclusively for couples. Other theaters can be booked by groups as well.',
  },
  {
    q: 'Can I decorate the theater?',
    a: 'Absolutely! All bookings include a complimentary base decoration setup. You can also add premium decoration packages via our add-ons menu.',
  },
  {
    q: 'How early should I arrive?',
    a: 'We recommend arriving 10–15 minutes before your slot starts. This allows you to settle in, check the setup, and start your session on time.',
  },
];

async function fetchFaqs(): Promise<{ faqs: FaqItem[]; waNumber: string }> {
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api';
  try {
    const res = await fetch(`${apiUrl}/settings`, { next: { revalidate: 120 } });
    if (!res.ok) return { faqs: DEFAULT_FAQS, waNumber: '919999999999' };
    const data = (await res.json()) as { data?: Record<string, string> };
    const settings = data.data ?? {};
    let faqs: FaqItem[] = DEFAULT_FAQS;
    if (settings['faqs']) {
      try {
        faqs = JSON.parse(settings['faqs']) as FaqItem[];
      } catch {
        // ignore malformed JSON, use defaults
      }
    }
    return { faqs, waNumber: (settings['whatsapp_number'] ?? '919999999999').replace(/\D/g, '') };
  } catch {
    return { faqs: DEFAULT_FAQS, waNumber: '919999999999' };
  }
}

export default async function FAQPage() {
  const { faqs, waNumber } = await fetchFaqs();
  const waLink = `https://wa.me/${waNumber}?text=Hi%20I%20have%20a%20question%20about%20The%20Magic%20Screen`;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Frequently Asked{' '}
            <span className="text-[#D4A017]">Questions</span>
          </h1>
          <p className="text-[#888]">
            Everything you need to know about booking with The Magic Screen.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((item, i) => (
            <details
              key={i}
              className="group rounded-xl border border-white/10 bg-[#1A1A1A] overflow-hidden open:border-[#D4A017]/30 transition-all"
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer list-none text-white font-medium hover:text-[#D4A017] transition-colors">
                <span>{item.q}</span>
                <span className="text-[#D4A017] text-xl ml-4 flex-shrink-0 group-open:rotate-45 transition-transform duration-200">
                  +
                </span>
              </summary>
              <div className="px-5 pb-5 text-[#888] text-sm leading-relaxed border-t border-white/5 pt-4">
                {item.a}
              </div>
            </details>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-12 p-6 rounded-2xl border border-[#D4A017]/20 bg-[#D4A017]/5 text-center">
          <p className="text-white font-semibold mb-2">Still have questions?</p>
          <p className="text-[#888] text-sm mb-4">
            Our team typically replies within a few minutes on WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#1ebe5d] transition-colors text-sm"
            >
              <MessageCircle size={16} /> Chat on WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-medium rounded-xl hover:bg-white/5 transition-colors text-sm"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
