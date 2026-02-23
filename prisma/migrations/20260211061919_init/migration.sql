-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('SECTION', 'TEXT', 'IMAGE', 'VIDEO', 'ARRAY');

-- CreateTable
CREATE TABLE "content_sections" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "data" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "content_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "content_sections_key_key" ON "content_sections"("key");
