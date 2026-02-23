-- CreateTable
CREATE TABLE "invoice_settings" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_address" TEXT NOT NULL,
    "company_city" TEXT NOT NULL,
    "company_country" TEXT NOT NULL DEFAULT 'Lithuania',
    "company_code" TEXT,
    "vat_number" TEXT,
    "is_vat_payer" BOOLEAN NOT NULL DEFAULT false,
    "vat_rate" DOUBLE PRECISION NOT NULL DEFAULT 21,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "bank_name" TEXT,
    "bank_account" TEXT,
    "bank_iban" TEXT,
    "bank_swift" TEXT,
    "invoice_prefix" TEXT NOT NULL DEFAULT 'CM',
    "next_invoice_number" INTEGER NOT NULL DEFAULT 1,
    "default_language" TEXT NOT NULL DEFAULT 'lt',
    "default_due_days" INTEGER NOT NULL DEFAULT 14,
    "default_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_settings_pkey" PRIMARY KEY ("id")
);
