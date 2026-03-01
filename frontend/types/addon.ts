/**
 * types/addon.ts
 * Type definitions for add-ons, cakes, food categories, and food items.
 */

/** Add-on category type */
export type AddonCategory = 'decoration' | 'rose' | 'photography';

/** A bookable add-on (decoration, rose, photography package) */
export interface AddonItem {
  id: string;
  category: AddonCategory;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  emoji?: string;
  is_active: boolean;
  sort_order: number;
}

/** A cake option available for booking */
export interface CakeItem {
  id: string;
  name: string;
  flavor: string;
  price: number;
  is_eggless: boolean;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
}

/** A single size/price variant option for a food item */
export interface FoodVariant {
  size: string;   // e.g. "Single", "Full", "1 Pcs", "Regular"
  price: number;
}

/** Food menu category */
export interface FoodCategory {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  food_items: FoodItem[];
}

/** A single item on the food menu */
export interface FoodItem {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  is_veg: boolean;
  image_url?: string;
  is_available: boolean;
  variants?: FoodVariant[];   // present when item has size options
  sort_order: number;
}

/** A food item selected during the booking wizard */
export interface FoodOrderItem {
  food_item_id: string;
  food_item: FoodItem;
  variant_size?: string;  // which size was selected; undefined for fixed-price items
  quantity: number;
  unit_price: number;     // actual price for the selected variant
}
