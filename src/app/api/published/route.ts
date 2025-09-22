import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const publishedVideos = await prisma.videoProposal.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: {
        updatedAt: 'desc', // Order by when they were published
      },
    });
    return NextResponse.json(publishedVideos);
  } catch (error) {
    console.error("Error fetching published videos:", error);
    return NextResponse.json({ error: 'Error fetching published videos' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
