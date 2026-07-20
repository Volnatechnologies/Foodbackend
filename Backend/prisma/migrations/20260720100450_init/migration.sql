/*
  Warnings:

  - The values [RESTAURANT] on the enum `RestaurantType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RestaurantType_new" AS ENUM ('CAFE', 'CLOUD_KITCHEN', 'FOOD_TRUCK');
ALTER TABLE "Restaurant" ALTER COLUMN "restaurantType" TYPE "RestaurantType_new" USING ("restaurantType"::text::"RestaurantType_new");
ALTER TYPE "RestaurantType" RENAME TO "RestaurantType_old";
ALTER TYPE "RestaurantType_new" RENAME TO "RestaurantType";
DROP TYPE "public"."RestaurantType_old";
COMMIT;
