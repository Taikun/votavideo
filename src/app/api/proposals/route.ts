import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const proposals = await prisma.videoProposal.findMany({
      where: {
        status: 'VOTING',
      },
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
    console.error("Error fetching proposals:", error);
    return NextResponse.json({ error: 'Error fetching proposals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, description, thumbnailUrl } = await request.json();

    if (!title || !description || !thumbnailUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newProposal = await prisma.videoProposal.create({
      data: {
        title,
        description,
        thumbnailUrl,
      },
    });

    return NextResponse.json(newProposal, { status: 201 });
  } catch (error) {
    console.error("Error creating proposal:", error);
    return NextResponse.json({ error: 'Error creating proposal' }, { status: 500 });
  }
}
