-- AlterTable: Add billing fields to Organization
ALTER TABLE "Organization" ADD COLUMN "planPriceId" TEXT;
ALTER TABLE "Organization" ADD COLUMN "subscriptionStatus" TEXT;
ALTER TABLE "Organization" ADD COLUMN "currentPeriodEnd" TIMESTAMP(3);
ALTER TABLE "Organization" ADD COLUMN "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Organization" ADD COLUMN "lastInvoiceStatus" TEXT;

-- CreateTable: BillingEvent for webhook idempotency
CREATE TABLE "BillingEvent" (
    "id" TEXT NOT NULL,
    "stripeEventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "organizationId" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillingEvent_stripeEventId_key" ON "BillingEvent"("stripeEventId");

-- CreateIndex
CREATE INDEX "BillingEvent_stripeEventId_idx" ON "BillingEvent"("stripeEventId");

-- CreateIndex
CREATE INDEX "BillingEvent_organizationId_idx" ON "BillingEvent"("organizationId");
