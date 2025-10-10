-- Ensure PENDING value exists even on Postgres versions without IF NOT EXISTS support
DO $$
BEGIN
  ALTER TYPE "VideoStatus" ADD VALUE 'PENDING';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;
