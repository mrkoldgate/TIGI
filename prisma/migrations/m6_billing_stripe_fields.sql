-- Migration: M6 — Add Stripe billing fields to users table
-- Run: npx prisma migrate dev --name m6_billing_stripe_fields
--
-- Adds three optional Stripe-specific columns to the users table.
-- All columns are nullable so existing rows are unaffected.
-- No backfill required — values populated when BILLING_PROVIDER=stripe.

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "stripeCustomerId"      TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS "stripeSubscriptionId"  TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS "stripeCurrentPeriodEnd" TIMESTAMP(3);
