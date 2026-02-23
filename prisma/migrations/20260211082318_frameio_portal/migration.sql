-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'APPROVED', 'CHANGES_REQUESTED');

-- CreateEnum
CREATE TYPE "AnnotationType" AS ENUM ('RECTANGLE', 'CIRCLE', 'ARROW', 'FREEHAND', 'PIN');

-- AlterEnum
ALTER TYPE "CommentType" ADD VALUE 'TIMELINE';

-- CreateTable
CREATE TABLE "timeline_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" DOUBLE PRECISION NOT NULL,
    "deliverable_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "author_type" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timeline_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annotations" (
    "id" TEXT NOT NULL,
    "type" "AnnotationType" NOT NULL,
    "color" TEXT NOT NULL,
    "coordinates" JSONB NOT NULL,
    "timestamp" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "deliverable_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "annotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "version_id" TEXT NOT NULL,
    "deliverable_id" TEXT NOT NULL,
    "approver_id" TEXT NOT NULL,
    "approver_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliverable_versions" (
    "id" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "notes" TEXT,
    "deliverable_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliverable_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "timeline_comments_deliverable_id_timestamp_idx" ON "timeline_comments"("deliverable_id", "timestamp");

-- CreateIndex
CREATE INDEX "timeline_comments_resolved_idx" ON "timeline_comments"("resolved");

-- CreateIndex
CREATE INDEX "annotations_deliverable_id_timestamp_idx" ON "annotations"("deliverable_id", "timestamp");

-- CreateIndex
CREATE INDEX "approvals_deliverable_id_idx" ON "approvals"("deliverable_id");

-- CreateIndex
CREATE INDEX "approvals_status_idx" ON "approvals"("status");

-- CreateIndex
CREATE INDEX "deliverable_versions_deliverable_id_idx" ON "deliverable_versions"("deliverable_id");

-- AddForeignKey
ALTER TABLE "timeline_comments" ADD CONSTRAINT "timeline_comments_deliverable_id_fkey" FOREIGN KEY ("deliverable_id") REFERENCES "deliverables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_comments" ADD CONSTRAINT "timeline_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "timeline_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_deliverable_id_fkey" FOREIGN KEY ("deliverable_id") REFERENCES "deliverables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_deliverable_id_fkey" FOREIGN KEY ("deliverable_id") REFERENCES "deliverables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverable_versions" ADD CONSTRAINT "deliverable_versions_deliverable_id_fkey" FOREIGN KEY ("deliverable_id") REFERENCES "deliverables"("id") ON DELETE CASCADE ON UPDATE CASCADE;
