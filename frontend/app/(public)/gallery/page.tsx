/**
 * @file Gallery page — photo gallery of theater spaces and celebrations
 * @module app/(public)/gallery/page
 */
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'View photos and videos of The Magic Screen private theaters — our spaces, decorations, and celebrations.',
};

const GALLERY_ITEMS = [
  { id: 1,  src: 'https://picsum.photos/seed/theater1/600/400', category: 'Theaters',      label: 'Private Screening Room',   h: 200 },
  { id: 2,  src: 'https://picsum.photos/seed/bday2/600/800',    category: 'Birthdays',     label: 'Birthday Surprise',        h: 260 },
  { id: 3,  src: 'https://picsum.photos/seed/anniv3/600/600',   category: 'Anniversaries', label: 'Anniversary Night',        h: 220 },
  { id: 4,  src: 'https://picsum.photos/seed/prop4/600/800',    category: 'Proposals',     label: 'The Big Question',         h: 280 },
  { id: 5,  src: 'https://picsum.photos/seed/decor5/600/600',   category: 'Decorations',   label: 'Balloon Extravaganza',     h: 200 },
  { id: 6,  src: 'https://picsum.photos/seed/roses6/600/700',   category: 'Decorations',   label: 'Rose Petal Setup',         h: 240 },
  { id: 7,  src: 'https://picsum.photos/seed/party7/600/800',   category: 'Birthdays',     label: 'Surprise Party',           h: 260 },
  { id: 8,  src: 'https://picsum.photos/seed/gold8/600/600',    category: 'Anniversaries', label: 'Golden Anniversary',       h: 200 },
  { id: 9,  src: 'https://picsum.photos/seed/scarlet9/600/800', category: 'Theaters',      label: 'Scarlet Theater',          h: 280 },
  { id: 10, src: 'https://picsum.photos/seed/galaxy10/600/600', category: 'Theaters',      label: 'Galaxy Screen',            h: 220 },
  { id: 11, src: 'https://picsum.photos/seed/fairy11/600/700',  category: 'Decorations',   label: 'Fairy Light Setup',        h: 240 },
  { id: 12, src: 'https://picsum.photos/seed/candle12/600/800', category: 'Proposals',     label: 'Candlelight Proposal',     h: 200 },
  { id: 13, src: 'https://picsum.photos/seed/music13/600/600',  category: 'Birthdays',     label: 'Musical Birthday',         h: 260 },
  { id: 14, src: 'https://picsum.photos/seed/mid14/600/800',    category: 'Theaters',      label: 'Midnight Screening',       h: 280 },
  { id: 15, src: 'https://picsum.photos/seed/love15/600/600',   category: 'Anniversaries', label: 'Love Story',               h: 200 },
  { id: 16, src: 'https://picsum.photos/seed/photo16/600/700',  category: 'Decorations',   label: 'Photo Wall Setup',         h: 240 },
] as const;

export default function GalleryPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Gallery
          </h1>
          <p className="text-[#888] text-lg max-w-xl mx-auto">
            A glimpse into the memories created at The Magic Screen.
          </p>
        </div>

        {/* Category filter display (static labels) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {['All', 'Theaters', 'Birthdays', 'Anniversaries', 'Proposals', 'Decorations'].map(
            (cat, i) => (
              <span
                key={cat}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  i === 0
                    ? 'bg-[#D4A017] text-black border-[#D4A017]'
                    : 'border-white/10 text-[#888]'
                }`}
              >
                {cat}
              </span>
            ),
          )}
        </div>

        {/* Masonry gallery grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {GALLERY_ITEMS.map((item) => (
            <div
              key={item.id}
              className="break-inside-avoid rounded-xl border border-white/10 bg-[#1A1A1A] overflow-hidden hover:border-[#D4A017]/40 transition-all group cursor-pointer"
            >
              <div
                className="overflow-hidden"
                style={{ height: `${item.h}px` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <p className="text-xs text-[#D4A017]">{item.category}</p>
                <p className="text-sm text-white font-medium">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <p className="text-[#888] mb-4">
            Want to see more? Follow us on Instagram for daily updates.
          </p>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#D4A017]/40 text-[#D4A017] rounded-xl hover:bg-[#D4A017]/10 transition-all text-sm font-medium"
          >
            Follow on Instagram
          </a>
        </div>
      </div>
    </div>
  );
}
