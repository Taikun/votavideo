import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getAuthOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(getAuthOptions());

  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const proposals = await prisma.videoProposal.findMany({
      include: {
        _count: {
          select: { votes: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(proposals);
  } catch (error) {
    console.error("Error fetching all proposals:", error);
    return NextResponse.json({ error: 'Error fetching proposals' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
