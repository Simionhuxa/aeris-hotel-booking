CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TABLE "Room" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "capacity" INTEGER NOT NULL CHECK ("capacity" > 0), "area" INTEGER NOT NULL, "priceCents" INTEGER NOT NULL CHECK ("priceCents" > 0));
CREATE TABLE "Booking" (
 "id" TEXT PRIMARY KEY, "reference" TEXT NOT NULL UNIQUE, "cancellationHash" TEXT NOT NULL,
 "roomId" TEXT NOT NULL REFERENCES "Room"("id"), "checkIn" DATE NOT NULL, "checkOut" DATE NOT NULL,
 "adults" INTEGER NOT NULL CHECK ("adults" > 0), "children" INTEGER NOT NULL CHECK ("children" >= 0),
 "firstName" TEXT NOT NULL, "lastName" TEXT NOT NULL, "email" TEXT NOT NULL, "phone" TEXT NOT NULL, "country" TEXT NOT NULL, "note" TEXT NOT NULL,
 "nightlyCents" INTEGER NOT NULL CHECK ("nightlyCents" > 0), "totalCents" INTEGER NOT NULL CHECK ("totalCents" > 0),
 "currency" TEXT NOT NULL DEFAULT 'USD' CHECK ("currency" = 'USD'), "status" TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK ("status" IN ('CONFIRMED','CANCELLED')),
 "demo" BOOLEAN NOT NULL DEFAULT true CHECK ("demo" = true), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK ("checkOut" > "checkIn" AND "checkOut" - "checkIn" <= 30),
 CONSTRAINT "booking_no_overlap" EXCLUDE USING gist ("roomId" WITH =, daterange("checkIn", "checkOut", '[)') WITH &&) WHERE ("status" = 'CONFIRMED')
);
CREATE INDEX "Booking_status_createdAt_idx" ON "Booking"("status", "createdAt");
CREATE TABLE "ContactMessage" ("id" TEXT PRIMARY KEY, "firstName" TEXT NOT NULL, "lastName" TEXT NOT NULL, "email" TEXT NOT NULL, "topic" TEXT NOT NULL, "message" TEXT NOT NULL, "demo" BOOLEAN NOT NULL DEFAULT true CHECK ("demo" = true), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "Admin" ("id" TEXT PRIMARY KEY, "email" TEXT NOT NULL UNIQUE, "passwordHash" TEXT NOT NULL);
CREATE TABLE "AdminSession" ("tokenHash" TEXT PRIMARY KEY, "adminId" TEXT NOT NULL REFERENCES "Admin"("id") ON DELETE CASCADE, "expiresAt" TIMESTAMP(3) NOT NULL);
