/**
 * @file Add-ons catalog page — shows all available add-ons with pricing
 * @module app/(public)/addons/page
 */
import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Add-Ons & Decorations',
  description:
    'Browse add-ons available for your private theater booking — decorations, roses, photography packages, and more.',
};

interface AddonItem {
  name: string;
  price: number;
  desc: string;
}

interface AddonCategory {
  name: string;
  emoji: string;
  items: AddonItem[];
}

const ADDON_CATEGORIES: AddonCategory[] = [
  {
    name: 'Decorations',
    emoji: '🎉',
    items: [
      { name: 'Fog Effect', price: 499, desc: 'Atmospheric fog for a cinematic ambiance' },
      { name: 'Photo Clippings', price: 299, desc: 'Custom photo prints on string lights' },
      { name: 'Cold Fire Effect', price: 599, desc: 'Safe cold pyrotechnics for celebrations' },
      { name: 'Candle Path', price: 349, desc: 'Romantic candle pathway arrangement' },
      { name: 'Party Props', price: 249, desc: 'Fun photo booth props set' },
      { name: 'LED Numbers', price: 299, desc: 'LED age/year display numbers' },
      { name: 'HBD Letters', price: 349, desc: 'Happy Birthday letter balloons' },
    ],
  },
  {
    name: 'Roses',
    emoji: '🌹',
    items: [
      { name: 'Single Rose', price: 99, desc: 'Fresh single red rose' },
      { name: 'Bouquet (12 roses)', price: 549, desc: 'Beautiful dozen red rose bouquet' },
    ],
  },
  {
    name: 'Photography',
    emoji: '📸',
    items: [
      {
        name: '20 Photos Package',
        price: 999,
        desc: 'Professional photographer for 20 edited photos',
      },
      {
        name: '50 Photos Package',
        price: 1799,
        desc: 'Professional photographer for 50 edited photos',
      },
      {
        name: '75 Photos Package',
        price: 2499,
        desc: 'Professional photographer for 75 edited photos',
      },
      {
        name: '100 Photos Package',
        price: 2999,
        desc: 'Professional photographer for 100 edited photos',
      },
      {
        name: '1-Hour Unlimited',
        price: 3999,
        desc: 'Photographer for full 1 hour — unlimited shots',
      },
    ],
  },
];

export default function AddonsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Add-Ons &amp; <span className="text-[#D4A017]">Extras</span>
          </h1>
          <p className="text-[#888] text-lg max-w-xl mx-auto">
            Make your celebration even more special with our premium add-ons. All items can be
            selected during booking.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-full text-[#D4A017] text-sm">
            &#10003; All add-ons are available at checkout during booking
          </div>
        </div>

        <div className="space-y-12">
          {ADDON_CATEGORIES.map((cat) => (
            <section key={cat.name}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{cat.emoji}</span>
                <h2
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {cat.name}
                </h2>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.items.map((item) => (
                  <div
                    key={item.name}
                    className="p-5 rounded-2xl border border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/40 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white group-hover:text-[#D4A017] transition-colors">
                        {item.name}
                      </h3>
                      <span className="text-[#D4A017] font-bold text-sm ml-2 whitespace-nowrap">
                        &#8377;{item.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-sm text-[#888]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Note on base decoration */}
        <div className="mt-10 p-5 rounded-2xl border border-[#D4A017]/20 bg-[#D4A017]/5">
          <p className="text-sm text-[#888]">
            <span className="text-[#D4A017] font-semibold">Note:</span> All bookings include a
            complimentary base decoration setup at no additional cost. The items above are premium
            upgrades to enhance your experience further.
          </p>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/theaters"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#D4A017] text-black font-bold rounded-xl hover:bg-[#D4A017]/90 transition-all hover:scale-105"
          >
            Book with Add-Ons <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
