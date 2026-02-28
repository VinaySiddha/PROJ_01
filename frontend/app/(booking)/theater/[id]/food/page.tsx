/**
 * @file Booking wizard Step 5 — food pre-order (optional)
 * @module app/(booking)/theater/[id]/food/page
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useBookingStore } from '../../../../../store/bookingStore';
import { BookingStepIndicator } from '../../../../../components/booking/BookingStepIndicator';
import { ChevronLeft, ChevronRight, Plus, Minus, Loader2 } from 'lucide-react';
import { apiClient } from '../../../../../lib/api';
import { formatCurrency } from '../../../../../lib/formatters';
import type { FoodCategory, FoodItem } from '../../../../../types/addon';

/** Step labels for the booking wizard */
const BOOKING_STEPS = ['Date & Slot', 'Occasion', 'Cake', 'Add-Ons', 'Food', 'Details', 'Summary'];

export default function FoodPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const store = useBookingStore();

  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<{ data: FoodCategory[] }>('/food/categories')
      .then((res) => setCategories(res.data.data ?? []))
      .catch(() => {
        /* Silently fail — food is optional */
      })
      .finally(() => setLoading(false));
  }, []);

  const getQty = (itemId: string): number =>
    store.foodItems.find((f) => f.food_item_id === itemId)?.quantity ?? 0;

  const updateQty = (item: FoodItem, qty: number) => {
    store.setFoodItem({
      food_item_id: item.id,
      food_item: item,
      quantity: qty,
      unit_price: item.price,
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push(`/theater/${params.id}/addons`)}
            className="text-sm text-[#888] hover:text-white transition-colors flex items-center gap-1 mb-4"
          >
            <ChevronLeft size={14} /> Back
          </button>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Pre-order food &amp; drinks
          </h1>
          <p className="text-[#888] text-sm mt-1">
            Optional — food will be ready when you arrive.
          </p>
        </div>

        {/* Step Indicator */}
        <BookingStepIndicator steps={BOOKING_STEPS} currentStep={5} />
        <div className="mb-10" />

        {/* Food grid */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-[#888]">
            <p>Food menu not available. You can order at the venue.</p>
          </div>
        ) : (
          <div className="space-y-8 mb-8">
            {categories.map((cat) => (
              <div key={cat.id}>
                <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <span>{cat.name}</span>
                </h2>
                <div className="space-y-2">
                  {cat.food_items.map((item) => {
                    const qty = getQty(item.id);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-[#1A1A1A]"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3 h-3 rounded-sm border-2 flex-shrink-0 ${
                                item.is_veg ? 'border-green-500' : 'border-red-500'
                              }`}
                            />
                            <p className="font-medium text-white text-sm truncate">
                              {item.name}
                            </p>
                          </div>
                          <p className="text-xs text-[#888] mt-0.5 ml-5">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {qty > 0 ? (
                            <>
                              <button
                                type="button"
                                onClick={() => updateQty(item, qty - 1)}
                                className="w-7 h-7 rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-5 text-center text-sm font-semibold text-white">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQty(item, qty + 1)}
                                className="w-7 h-7 rounded-lg border border-[#D4A017]/50 bg-[#D4A017]/10 flex items-center justify-center text-[#D4A017] hover:bg-[#D4A017]/20 transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => updateQty(item, 1)}
                              className="px-3 py-1.5 rounded-lg border border-[#D4A017]/50 text-[#D4A017] text-xs font-medium hover:bg-[#D4A017]/10 transition-colors"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.push(`/theater/${params.id}/addons`)}
            className="flex items-center gap-2 px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <button
            type="button"
            onClick={() => router.push(`/theater/${params.id}/details`)}
            className="flex items-center gap-2 px-8 py-3 bg-[#D4A017] text-black font-bold rounded-xl hover:bg-[#D4A017]/90 transition-all"
          >
            Continue <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
