/**
 * @file Food menu page — pre-order food available during theater booking
 * @module app/(public)/food/page
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Food Menu',
  description:
    'Browse our food and beverage menu available for pre-order with your private theater booking.',
};

interface FoodItem {
  name: string;
  price: number;
  veg: boolean;
  desc: string;
}

interface FoodCategory {
  category: string;
  emoji: string;
  items: FoodItem[];
}

const FOOD_MENU: FoodCategory[] = [
  {
    category: 'Snacks',
    emoji: '🍟',
    items: [
      {
        name: 'Loaded Nachos',
        price: 249,
        veg: true,
        desc: 'Crispy nachos with cheese sauce, jalapeños, and salsa',
      },
      {
        name: 'Paneer Tikka',
        price: 299,
        veg: true,
        desc: 'Marinated cottage cheese grilled to perfection',
      },
      {
        name: 'Chicken Popcorn',
        price: 279,
        veg: false,
        desc: 'Crispy bite-sized chicken bites',
      },
    ],
  },
  {
    category: 'Thickshakes',
    emoji: '🥤',
    items: [
      { name: 'Oreo Blast', price: 179, veg: true, desc: 'Creamy Oreo cookie thickshake' },
      { name: 'Kitkat Crunch', price: 179, veg: true, desc: 'Rich Kitkat bar thickshake' },
      {
        name: 'Butterscotch Dream',
        price: 169,
        veg: true,
        desc: 'Classic butterscotch thickshake',
      },
    ],
  },
  {
    category: 'Mojitos',
    emoji: '🍹',
    items: [
      {
        name: 'Virgin Mint Mojito',
        price: 149,
        veg: true,
        desc: 'Refreshing mint and lime mojito',
      },
      { name: 'Watermelon Splash', price: 159, veg: true, desc: 'Fresh watermelon mojito' },
      {
        name: 'Blue Lagoon',
        price: 159,
        veg: true,
        desc: 'Blue curacao and lemonade cooler',
      },
    ],
  },
  {
    category: 'Ice Cream',
    emoji: '🍦',
    items: [
      {
        name: 'Vanilla Scoop (2)',
        price: 99,
        veg: true,
        desc: 'Classic Madagascar vanilla scoops',
      },
      {
        name: 'Sundae Delight',
        price: 149,
        veg: true,
        desc: 'Vanilla with hot fudge and nuts',
      },
      {
        name: 'Brownie + Ice Cream',
        price: 199,
        veg: true,
        desc: 'Warm chocolate brownie with ice cream',
      },
    ],
  },
];

export default function FoodPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Food <span className="text-[#D4A017]">Menu</span>
          </h1>
          <p className="text-[#888] text-lg max-w-xl mx-auto">
            Pre-order snacks and drinks with your booking. Food will be ready when you arrive.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-full text-[#D4A017] text-sm">
            &#10003; Pre-order available during booking checkout
          </div>
        </div>

        {/* Outside food note */}
        <div className="mb-8 p-4 rounded-xl border border-white/10 bg-[#1A1A1A] text-center">
          <p className="text-sm text-[#888]">
            <span className="text-white font-medium">Outside food welcome!</span> You can also
            bring your own food and beverages. Our menu is for your convenience.
          </p>
        </div>

        <div className="space-y-10">
          {FOOD_MENU.map((cat) => (
            <section key={cat.category}>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">{cat.emoji}</span>
                <h2
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {cat.category}
                </h2>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cat.items.map((item) => (
                  <div
                    key={item.name}
                    className="p-5 rounded-2xl border border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/30 transition-all"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      <span className="text-[#D4A017] font-bold ml-2">
                        &#8377;{item.price}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          item.veg
                            ? 'bg-green-500/15 text-green-400'
                            : 'bg-red-500/15 text-red-400'
                        }`}
                      >
                        {item.veg ? '🟢 Veg' : '🔴 Non-Veg'}
                      </span>
                    </div>
                    <p className="text-sm text-[#888]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/theaters"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#D4A017] text-black font-bold rounded-xl hover:bg-[#D4A017]/90 transition-all hover:scale-105"
          >
            Book a Theater <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
