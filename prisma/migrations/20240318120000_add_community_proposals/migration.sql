-- Extend video proposals to support community submissions
ALTER TABLE "VideoProposal"
  ADD COLUMN "isCommunity" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "createdById" TEXT;

-- Ensure existing rows have a deterministic value
UPDATE "VideoProposal"
SET "isCommunity" = false
WHERE "isCommunity" IS NULL;

-- Link proposals back to their creators when available
ALTER TABLE "VideoProposal"
  ADD CONSTRAINT "VideoProposal_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
