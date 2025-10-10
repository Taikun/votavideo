-- Add the PENDING status for moderated community proposals
ALTER TYPE "VideoStatus" ADD VALUE IF NOT EXISTS 'PENDING';
