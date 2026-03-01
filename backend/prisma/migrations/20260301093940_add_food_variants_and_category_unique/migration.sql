/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `food_categories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "booking_food_items" ADD COLUMN     "variant_size" TEXT;

-- AlterTable
ALTER TABLE "food_items" ADD COLUMN     "variants" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "food_categories_name_key" ON "food_categories"("name");
