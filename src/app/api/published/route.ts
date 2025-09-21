import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
