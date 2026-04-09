/**
 * @file Booking wizard Step 5 — food pre-order with category tabs
 * @module app/(booking)/theater/[id]/food/page
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useBookingStore } from '../../../../../store/bookingStore';
import { BookingStepIndicator } from '../../../../../components/booking/BookingStepIndicator';
import { ChevronLeft, ChevronRight, Plus, Minus, ShoppingBag } from 'lucide-react';
import { apiClient } from '../../../../../lib/api';
import { formatCurrency } from '../../../../../lib/formatters';
import type { FoodCategory, FoodItem } from '../../../../../types/addon';

const BOOKING_STEPS = ['Date & Slot', 'Occasion', 'Cake', 'Add-Ons', 'Food', 'Details', 'Summary'];

export default function FoodPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const store = useBookingStore();
  const tabsRef = useRef<HTMLDivElement>(null);

  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<{ data: FoodCategory[] }>('/food/categories')
      .then((res) => {
        const cats = res.data.data ?? [];
        setCategories(cats);
        const firstCategory = cats[0];
        if (firstCategory) setActiveCategory(firstCategory.id);
      })
      .catch(() => {/* food is optional */})
      .finally(() => setLoading(false));
  }, []);

  const getQty = (itemId: string, variantSize?: string): number =>
    store.foodItems.find(
      (f) => f.food_item_id === itemId && f.variant_size === variantSize,
    )?.quantity ?? 0;

  const resolvePrice = (item: FoodItem, variantSize?: string): number => {
    if (variantSize && item.variants) {
      return item.variants.find((v) => v.size === variantSize)?.price ?? item.price;
    }
    return item.price;
  };

  const updateQty = (item: FoodItem, qty: number, variantSize?: string) => {
    store.setFoodItem({
      food_item_id: item.id,
      food_item: item,
      variant_size: variantSize,
      quantity: qty,
      unit_price: resolvePrice(item, variantSize),
    });
  };

  const totalItems = store.foodItems.reduce((s, f) => s + f.quantity, 0);
  const totalPrice = store.foodItems.reduce((s, f) => s + f.quantity * f.unit_price, 0);
  const activeItems = activeCategory
    ? (categories.find((c) => c.id === activeCategory)?.food_items ?? [])
    : [];
  const itemPluralSuffix = totalItems === 1 ? '' : 's';

  const scrollTabIntoView = (catId: string) => {
    if (!tabsRef.current) return;
    const btn = tabsRef.current.querySelector(`[data-cat="${catId}"]`) as HTMLElement | null;
    btn?.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
  };

  const handleCategoryClick = (catId: string) => {
    setActiveCategory(catId);
    scrollTabIntoView(catId);
  };

  let content: React.ReactNode;
  if (loading) {
    content = (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
      </div>
    );
  } else if (categories.length === 0) {
    content = (
      <div className="text-center py-12 text-[#888]">
        <p>Food menu not available. You can order at the venue.</p>
      </div>
    );
  } else {
    content = (
      <>
        {/* ── Category Tabs ───────────────────────────────────── */}
        <div
          ref={tabsRef}
          className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {categories.map((cat) => {
            const hasSelected = store.foodItems.some(
              (f) => cat.food_items.some((i) => i.id === f.food_item_id),
            );
            return (
              <button
                key={cat.id}
                data-cat={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-[#D4A017] text-black'
                    : 'border border-white/10 bg-[#1A1A1A] text-[#888] hover:text-white hover:border-[#D4A017]/40'
                }`}
              >
                {cat.name}
                {hasSelected && activeCategory !== cat.id && (
                  <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-[#D4A017] inline-block" />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Items for active category ───────────────────────── */}
        <div className="space-y-2 mb-6">
          {activeItems.map((item) => {
            const hasVariants = item.variants && item.variants.length > 0;
            const firstVariantPrice = item.variants?.[0]?.price;
            const itemPriceLabel = hasVariants && firstVariantPrice != null
              ? `from ${formatCurrency(firstVariantPrice)}`
              : formatCurrency(item.price);

            return (
              <div key={item.id} className="rounded-xl border border-white/10 bg-[#1A1A1A] overflow-hidden">
                {/* Main row */}
                <div className="flex items-center gap-3 p-3">
                  {/* Veg/non-veg indicator */}
                  <span
                    className={`w-3 h-3 rounded-sm border-2 flex-shrink-0 ${
                      item.is_veg ? 'border-green-500' : 'border-red-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm">{item.name}</p>
                    <p className="text-xs text-[#888] mt-0.5">{itemPriceLabel}</p>
                  </div>

                  {/* Fixed-price: +/- controls */}
                  {!hasVariants && (
                    <div className="flex items-center gap-2 shrink-0">
                      {getQty(item.id) > 0 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => updateQty(item, getQty(item.id) - 1)}
                            className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-white">
                            {getQty(item.id)}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item, getQty(item.id) + 1)}
                            className="w-8 h-8 rounded-lg bg-[#D4A017] flex items-center justify-center text-black hover:bg-[#D4A017]/90 transition-colors"
                          >
                            <Plus size={13} />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateQty(item, 1)}
                          className="w-8 h-8 rounded-lg border border-[#D4A017]/60 flex items-center justify-center text-[#D4A017] hover:bg-[#D4A017]/10 transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Variant rows — always visible when item has variants */}
                {hasVariants && (
                  <div className="border-t border-white/5 divide-y divide-white/5">
                    {item.variants!.map((v) => {
                      const qty = getQty(item.id, v.size);
                      return (
                        <div key={v.size} className="flex items-center justify-between px-4 py-2.5">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-white">{v.size}</span>
                            <span className="text-xs text-[#D4A017] font-medium">{formatCurrency(v.price)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {qty > 0 ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => updateQty(item, qty - 1, v.size)}
                                  className="w-7 h-7 rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="w-5 text-center text-sm font-bold text-white">{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQty(item, qty + 1, v.size)}
                                  className="w-7 h-7 rounded-lg bg-[#D4A017] flex items-center justify-center text-black hover:bg-[#D4A017]/90 transition-colors"
                                >
                                  <Plus size={12} />
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => updateQty(item, 1, v.size)}
                                className="w-7 h-7 rounded-lg border border-[#D4A017]/60 flex items-center justify-center text-[#D4A017] hover:bg-[#D4A017]/10 transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-28 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.push(`/theater/${params.id}/addons`)}
            className="text-sm text-[#888] hover:text-white transition-colors flex items-center gap-1 mb-4"
          >
            <ChevronLeft size={14} /> Back
          </button>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Pre-order Food &amp; Drinks
          </h1>
          <p className="text-[#888] text-sm mt-1">
            Optional — food will be ready when you arrive. You can also order at the venue.
          </p>
        </div>

        <BookingStepIndicator steps={BOOKING_STEPS} currentStep={5} />
        <div className="mb-6 sm:mb-7" />

        {content}

        {/* Navigation */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between sm:items-center">
          <button
            type="button"
            onClick={() => router.push(`/theater/${params.id}/addons`)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <button
            type="button"
            onClick={() => router.push(`/theater/${params.id}/details`)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#D4A017] text-black font-bold rounded-xl hover:bg-[#D4A017]/90 transition-all"
          >
            Continue <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ── Floating Cart Summary ──────────────────────────────────── */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
          <div className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl bg-[#D4A017] shadow-[0_8px_32px_rgba(212,160,23,0.4)]">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-black" />
              <span className="font-bold text-black text-sm">{totalItems} item{itemPluralSuffix}</span>
            </div>
            <span className="font-bold text-black">{formatCurrency(totalPrice)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
