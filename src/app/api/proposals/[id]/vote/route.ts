import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const proposalId = params.id;
  const userId = session.user.id;

  try {
    const newVote = await prisma.vote.create({
      data: {
        userId: userId,
        videoProposalId: proposalId,
      },
    });
    return NextResponse.json(newVote, { status: 201 });
  } catch (error: any) {
    // P2002 is the Prisma error code for a unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'You have already voted for this proposal.' }, { status: 409 });
    }
    console.error("Error creating vote:", error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
