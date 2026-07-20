-- CreateTable
CREATE TABLE "RestaurantDocument" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "fssaiCertificateUrl" TEXT NOT NULL,
    "gstCertificateUrl" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantDocument_restaurantId_key" ON "RestaurantDocument"("restaurantId");

-- CreateIndex
CREATE INDEX "RestaurantDocument_restaurantId_idx" ON "RestaurantDocument"("restaurantId");

-- AddForeignKey
ALTER TABLE "RestaurantDocument" ADD CONSTRAINT "RestaurantDocument_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
