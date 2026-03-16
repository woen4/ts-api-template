-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "plan_tier" TEXT NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_providers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "financial_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_open_finance_configs" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "provider_id" INTEGER NOT NULL,
    "encrypted_credentials" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "company_open_finance_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp_providers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "api_version" TEXT NOT NULL,

    CONSTRAINT "erp_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_erp_configs" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "erp_provider_id" INTEGER NOT NULL,
    "external_api_key" TEXT NOT NULL,
    "endpoint_url" TEXT NOT NULL,
    "settings" JSONB NOT NULL,

    CONSTRAINT "company_erp_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_statements" (
    "id" TEXT NOT NULL,
    "company_integration_id" TEXT NOT NULL,
    "period_date" DATE NOT NULL,
    "file_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_transactions" (
    "id" TEXT NOT NULL,
    "company_integration_id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "date" DATE NOT NULL,
    "raw_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp_sync_logs" (
    "id" TEXT NOT NULL,
    "erp_provider_id" INTEGER NOT NULL,
    "reference_id" TEXT NOT NULL,
    "reference_type" TEXT NOT NULL,
    "sync_status" TEXT NOT NULL,
    "erp_response" TEXT,
    "synced_at" TIMESTAMP(3),

    CONSTRAINT "erp_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_cnpj_key" ON "companies"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "erp_providers_slug_key" ON "erp_providers"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "bank_transactions_external_id_key" ON "bank_transactions"("external_id");

-- AddForeignKey
ALTER TABLE "company_open_finance_configs" ADD CONSTRAINT "company_open_finance_configs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_open_finance_configs" ADD CONSTRAINT "company_open_finance_configs_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "financial_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_erp_configs" ADD CONSTRAINT "company_erp_configs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_erp_configs" ADD CONSTRAINT "company_erp_configs_erp_provider_id_fkey" FOREIGN KEY ("erp_provider_id") REFERENCES "erp_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_statements" ADD CONSTRAINT "bank_statements_company_integration_id_fkey" FOREIGN KEY ("company_integration_id") REFERENCES "company_open_finance_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_company_integration_id_fkey" FOREIGN KEY ("company_integration_id") REFERENCES "company_open_finance_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp_sync_logs" ADD CONSTRAINT "erp_sync_logs_erp_provider_id_fkey" FOREIGN KEY ("erp_provider_id") REFERENCES "erp_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
