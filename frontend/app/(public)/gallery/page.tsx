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

/** Placeholder gallery items with varying heights for masonry effect */
const GALLERY_ITEMS = [
  { id: 1, emoji: '🎬', category: 'Theaters', label: 'The Grand Hall' },
  { id: 2, emoji: '🎂', category: 'Birthdays', label: 'Birthday Surprise' },
  { id: 3, emoji: '💑', category: 'Anniversaries', label: 'Anniversary Night' },
  { id: 4, emoji: '💍', category: 'Proposals', label: 'The Big Question' },
  { id: 5, emoji: '🎉', category: 'Decorations', label: 'Balloon Extravaganza' },
  { id: 6, emoji: '🌹', category: 'Decorations', label: 'Rose Petal Setup' },
  { id: 7, emoji: '🎊', category: 'Birthdays', label: 'Surprise Party' },
  { id: 8, emoji: '🥂', category: 'Anniversaries', label: 'Golden Anniversary' },
  { id: 9, emoji: '🎭', category: 'Theaters', label: 'Scarlet Theater' },
  { id: 10, emoji: '⭐', category: 'Theaters', label: 'Galaxy Screen' },
  { id: 11, emoji: '🌟', category: 'Decorations', label: 'Fairy Light Setup' },
  { id: 12, emoji: '✨', category: 'Proposals', label: 'Candlelight Proposal' },
  { id: 13, emoji: '🎵', category: 'Birthdays', label: 'Musical Birthday' },
  { id: 14, emoji: '🌙', category: 'Theaters', label: 'Midnight Screening' },
  { id: 15, emoji: '🫶', category: 'Anniversaries', label: 'Love Story' },
  { id: 16, emoji: '📸', category: 'Decorations', label: 'Photo Clippings' },
] as const;

/** Heights cycle for masonry visual variety */
const HEIGHTS = [200, 260, 220, 280, 200, 240, 260, 200, 280, 220, 240, 200, 260, 280, 200, 240] as const;

export default function GalleryPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
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
          {GALLERY_ITEMS.map((item, index) => (
            <div
              key={item.id}
              className="break-inside-avoid rounded-xl border border-white/10 bg-[#1A1A1A] overflow-hidden hover:border-[#D4A017]/40 transition-all group cursor-pointer"
            >
              <div
                className="bg-[#2A2A2A] flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300"
                style={{ height: `${HEIGHTS[index % HEIGHTS.length]}px` }}
              >
                {item.emoji}
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
