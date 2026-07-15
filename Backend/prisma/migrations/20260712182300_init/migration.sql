-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "RestaurantType" AS ENUM ('RESTAURANT', 'CAFE', 'CLOUD_KITCHEN', 'FOOD_TRUCK');

-- CreateEnum
CREATE TYPE "RestaurantStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'UNDER_VERIFICATION', 'ACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OWNER',
    "mobileVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "restaurantName" TEXT NOT NULL,
    "restaurantType" "RestaurantType" NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fssaiNumber" TEXT,
    "establishedYear" INTEGER,
    "addressLine" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "cuisineTypes" TEXT[],
    "status" "RestaurantStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessHour" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "openTime" TEXT,
    "closeTime" TEXT,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessHour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_mobileNumber_key" ON "User"("mobileNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_userId_key" ON "Restaurant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_contactNumber_key" ON "Restaurant"("contactNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_email_key" ON "Restaurant"("email");

-- CreateIndex
CREATE INDEX "Restaurant_status_idx" ON "Restaurant"("status");

-- CreateIndex
CREATE INDEX "Restaurant_currentStep_idx" ON "Restaurant"("currentStep");

-- CreateIndex
CREATE INDEX "Restaurant_city_idx" ON "Restaurant"("city");

-- CreateIndex
CREATE INDEX "Restaurant_restaurantType_idx" ON "Restaurant"("restaurantType");

-- CreateIndex
CREATE INDEX "BusinessHour_restaurantId_idx" ON "BusinessHour"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessHour_restaurantId_dayOfWeek_key" ON "BusinessHour"("restaurantId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessHour" ADD CONSTRAINT "BusinessHour_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
