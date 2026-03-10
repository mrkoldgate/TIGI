-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('INVESTOR', 'OWNER', 'BOTH', 'ADMIN', 'COMPLIANCE_OFFICER');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('BUYER', 'INVESTOR', 'SELLER', 'PROPERTY_OWNER', 'LAND_OWNER', 'DEVELOPER', 'LEGAL_PROFESSIONAL', 'FINANCIAL_PROFESSIONAL');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('NONE', 'PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('free', 'pro', 'pro_plus', 'enterprise');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'LAND', 'INDUSTRIAL', 'MIXED_USE');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'ACTIVE', 'SOLD', 'LEASED', 'DELISTED');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('BUY', 'LEASE', 'BOTH');

-- CreateEnum
CREATE TYPE "OwnershipModel" AS ENUM ('FULL', 'FRACTIONAL', 'BOTH');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('TITLE_DEED', 'INSPECTION', 'APPRAISAL', 'CONTRACT', 'OFFERING', 'OTHER');

-- CreateEnum
CREATE TYPE "TokenStatus" AS ENUM ('PENDING', 'ACTIVE', 'FROZEN', 'BURNED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('FRACTIONAL_INVESTMENT', 'FULL_PURCHASE', 'LEASE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('INITIATED', 'OFFER_PENDING', 'ESCROW_CREATED', 'ESCROW_FUNDED', 'CONDITIONS_MET', 'COMPLETED', 'FAILED', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('CREATED', 'FUNDED', 'RELEASED', 'REFUNDED', 'DISPUTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransferTrigger" AS ENUM ('MANUAL', 'DATE', 'INACTIVITY');

-- CreateEnum
CREATE TYPE "DesignationStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "LeaseDurationType" AS ENUM ('FIXED', 'FLEXIBLE', 'MONTH_TO_MONTH', 'NEGOTIABLE');

-- CreateEnum
CREATE TYPE "LeaseEscalationType" AS ENUM ('NONE', 'FIXED', 'CPI', 'PERCENT_PER_YEAR');

-- CreateEnum
CREATE TYPE "DevelopmentStage" AS ENUM ('RAW', 'ENTITLED', 'IMPROVED', 'SHOVEL_READY');

-- CreateEnum
CREATE TYPE "LegacyPlanStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "BeneficiaryRelationship" AS ENUM ('SPOUSE', 'PARTNER', 'CHILD', 'SIBLING', 'PARENT', 'GRANDCHILD', 'TRUSTEE', 'CHARITY', 'FRIEND', 'OTHER');

-- CreateEnum
CREATE TYPE "AiConfidence" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "UserDocPurpose" AS ENUM ('KYC', 'INHERITANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LISTING_APPROVED', 'LISTING_REJECTED', 'LISTING_UPDATE_REQUESTED', 'KYC_APPROVED', 'KYC_REJECTED', 'KYC_UPDATE_REQUESTED', 'INTENT_CREATED', 'LEASE_INTEREST_CREATED', 'INQUIRY_RECEIVED', 'INQUIRY_REPLIED', 'LEGACY_SUBMITTED', 'LEGACY_APPROVED', 'LEGACY_REJECTED', 'LEGACY_UPDATE_REQUESTED', 'SYSTEM_ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'PUSH');

-- CreateEnum
CREATE TYPE "IntentType" AS ENUM ('EXPRESS_INTEREST', 'PREPARE_PURCHASE', 'PREPARE_INVEST', 'PREPARE_LEASE');

-- CreateEnum
CREATE TYPE "IntentStatus" AS ENUM ('PENDING', 'REVIEWING', 'APPROVED', 'READY_TO_SIGN', 'EXECUTED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InquiryType" AS ENUM ('GENERAL', 'INTERESTED_BUYING', 'INTERESTED_INVESTING', 'INTERESTED_LEASING');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'READ', 'REPLIED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "avatarUrl" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'INVESTOR',
    "userType" "UserType",
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT,
    "bio" TEXT,
    "preferences" JSONB,
    "walletAddress" TEXT,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'NONE',
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'free',
    "subscriptionEndsAt" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripeCurrentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "custodial_wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "encryptedSecretKey" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL DEFAULT 'AES-256-GCM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custodial_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "listingType" "ListingType" NOT NULL DEFAULT 'BUY',
    "ownershipModel" "OwnershipModel" NOT NULL DEFAULT 'FULL',
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "zipCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "price" DECIMAL(14,2),
    "leaseRateMonthly" DECIMAL(12,2),
    "sqft" INTEGER,
    "bedrooms" INTEGER,
    "bathrooms" DOUBLE PRECISION,
    "yearBuilt" INTEGER,
    "lotAcres" DOUBLE PRECISION,
    "parcelId" TEXT,
    "zoningCode" TEXT,
    "isTokenized" BOOLEAN NOT NULL DEFAULT false,
    "tokenMintAddress" TEXT,
    "features" JSONB NOT NULL DEFAULT '[]',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "saveCount" INTEGER NOT NULL DEFAULT 0,
    "inquiryCount" INTEGER NOT NULL DEFAULT 0,
    "reviewNote" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "featuredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "listedAt" TIMESTAMP(3),
    "soldAt" TIMESTAMP(3),

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_images" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_documents" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "mintAddress" TEXT NOT NULL,
    "totalSupply" INTEGER NOT NULL,
    "availableSupply" INTEGER NOT NULL,
    "pricePerFraction" DECIMAL(12,2) NOT NULL,
    "status" "TokenStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadataUri" TEXT,
    "mintedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_holdings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "costBasis" DECIMAL(14,2) NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "token_holdings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'INITIATED',
    "amount" DECIMAL(14,2) NOT NULL,
    "fee" DECIMAL(14,2) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,
    "solanaSignature" TEXT,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_steps" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrows" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "status" "EscrowStatus" NOT NULL DEFAULT 'CREATED',
    "amount" DECIMAL(14,2) NOT NULL,
    "pdaAddress" TEXT,
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fundedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),

    CONSTRAINT "escrows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_verifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "providerRef" TEXT,
    "idFrontUrl" TEXT,
    "idBackUrl" TEXT,
    "selfieUrl" TEXT,
    "reviewedBy" TEXT,
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_listings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purpose" "UserDocPurpose" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "reviewedBy" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lease_terms" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "durationType" "LeaseDurationType" NOT NULL DEFAULT 'NEGOTIABLE',
    "minimumMonths" INTEGER,
    "maximumMonths" INTEGER,
    "rateMonthly" DECIMAL(14,2),
    "rateAnnual" DECIMAL(14,2),
    "ratePerAcre" DECIMAL(14,2),
    "securityDeposit" DECIMAL(14,2),
    "escalationType" "LeaseEscalationType" NOT NULL DEFAULT 'NONE',
    "escalationRate" DOUBLE PRECISION,
    "hasRenewalOption" BOOLEAN NOT NULL DEFAULT false,
    "renewalTermMonths" INTEGER,
    "hasPurchaseOption" BOOLEAN NOT NULL DEFAULT false,
    "purchaseOptionPrice" DECIMAL(14,2),
    "allowedUses" JSONB NOT NULL DEFAULT '[]',
    "prohibitedUses" JSONB NOT NULL DEFAULT '[]',
    "additionalTerms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lease_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "development_opportunities" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "stage" "DevelopmentStage" NOT NULL DEFAULT 'RAW',
    "zoningDescription" TEXT,
    "maxBuildableUnits" INTEGER,
    "maxFloorAreaRatio" DOUBLE PRECISION,
    "heightLimitFt" INTEGER,
    "utilitiesAvailable" JSONB NOT NULL DEFAULT '[]',
    "roadAccess" BOOLEAN NOT NULL DEFAULT false,
    "roadType" TEXT,
    "entitlementStatus" TEXT,
    "permitsAvailable" JSONB NOT NULL DEFAULT '[]',
    "environmentalStatus" TEXT,
    "topography" TEXT,
    "floodZone" TEXT,
    "highlights" JSONB NOT NULL DEFAULT '[]',
    "financingNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "development_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficiary_designations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHoldingId" TEXT NOT NULL,
    "beneficiaryEmail" TEXT NOT NULL,
    "beneficiaryName" TEXT,
    "sharePercent" INTEGER NOT NULL,
    "triggerType" "TransferTrigger" NOT NULL DEFAULT 'MANUAL',
    "triggerDate" TIMESTAMP(3),
    "inactivityDays" INTEGER,
    "status" "DesignationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "beneficiary_designations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legacy_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "LegacyPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "instructions" TEXT,
    "specialConditions" TEXT,
    "executorName" TEXT,
    "executorEmail" TEXT,
    "executorPhone" TEXT,
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legacy_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legacy_beneficiaries" (
    "id" TEXT NOT NULL,
    "legacyPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "relationship" "BeneficiaryRelationship" NOT NULL DEFAULT 'OTHER',
    "allocationPercent" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legacy_beneficiaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_valuations" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "estimatedValue" DECIMAL(14,2) NOT NULL,
    "valueRangeLow" DECIMAL(14,2) NOT NULL,
    "valueRangeHigh" DECIMAL(14,2) NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "confidence" "AiConfidence" NOT NULL,
    "methodology" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "modelVersion" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_valuations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "actionUrl" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiries" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "inquiryType" "InquiryType" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_intents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "intentType" "IntentType" NOT NULL,
    "status" "IntentStatus" NOT NULL DEFAULT 'PENDING',
    "fractionQty" INTEGER,
    "offerAmount" DECIMAL(14,2),
    "note" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "transaction_intents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeSubscriptionId_key" ON "users"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "custodial_wallets_userId_key" ON "custodial_wallets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "custodial_wallets_publicKey_key" ON "custodial_wallets"("publicKey");

-- CreateIndex
CREATE INDEX "properties_status_type_city_idx" ON "properties"("status", "type", "city");

-- CreateIndex
CREATE INDEX "properties_ownerId_idx" ON "properties"("ownerId");

-- CreateIndex
CREATE INDEX "properties_price_idx" ON "properties"("price");

-- CreateIndex
CREATE INDEX "property_images_propertyId_order_idx" ON "property_images"("propertyId", "order");

-- CreateIndex
CREATE INDEX "property_documents_propertyId_idx" ON "property_documents"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_propertyId_key" ON "tokens"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_mintAddress_key" ON "tokens"("mintAddress");

-- CreateIndex
CREATE UNIQUE INDEX "token_holdings_userId_tokenId_key" ON "token_holdings"("userId", "tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "escrows_transactionId_key" ON "escrows"("transactionId");

-- CreateIndex
CREATE INDEX "saved_listings_userId_idx" ON "saved_listings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_listings_userId_listingId_key" ON "saved_listings"("userId", "listingId");

-- CreateIndex
CREATE INDEX "user_documents_userId_purpose_idx" ON "user_documents"("userId", "purpose");

-- CreateIndex
CREATE UNIQUE INDEX "lease_terms_propertyId_key" ON "lease_terms"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "development_opportunities_propertyId_key" ON "development_opportunities"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "legacy_plans_userId_key" ON "legacy_plans"("userId");

-- CreateIndex
CREATE INDEX "legacy_beneficiaries_legacyPlanId_idx" ON "legacy_beneficiaries"("legacyPlanId");

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_idx" ON "notifications"("userId", "readAt");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "inquiries_fromUserId_idx" ON "inquiries"("fromUserId");

-- CreateIndex
CREATE INDEX "inquiries_ownerId_status_idx" ON "inquiries"("ownerId", "status");

-- CreateIndex
CREATE INDEX "inquiries_propertyId_idx" ON "inquiries"("propertyId");

-- CreateIndex
CREATE INDEX "transaction_intents_userId_idx" ON "transaction_intents"("userId");

-- CreateIndex
CREATE INDEX "transaction_intents_propertyId_idx" ON "transaction_intents"("propertyId");

-- CreateIndex
CREATE INDEX "transaction_intents_status_idx" ON "transaction_intents"("status");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custodial_wallets" ADD CONSTRAINT "custodial_wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_documents" ADD CONSTRAINT "property_documents_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_holdings" ADD CONSTRAINT "token_holdings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_holdings" ADD CONSTRAINT "token_holdings_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "tokens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_steps" ADD CONSTRAINT "transaction_steps_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_verifications" ADD CONSTRAINT "kyc_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_documents" ADD CONSTRAINT "user_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_terms" ADD CONSTRAINT "lease_terms_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "development_opportunities" ADD CONSTRAINT "development_opportunities_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary_designations" ADD CONSTRAINT "beneficiary_designations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legacy_plans" ADD CONSTRAINT "legacy_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legacy_beneficiaries" ADD CONSTRAINT "legacy_beneficiaries_legacyPlanId_fkey" FOREIGN KEY ("legacyPlanId") REFERENCES "legacy_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_valuations" ADD CONSTRAINT "ai_valuations_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_intents" ADD CONSTRAINT "transaction_intents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_intents" ADD CONSTRAINT "transaction_intents_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
