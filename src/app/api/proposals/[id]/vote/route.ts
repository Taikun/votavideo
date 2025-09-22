import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ParamsContext = { params: Promise<{ id: string }> };

export async function POST(
  request: Request,
  context: ParamsContext
) {
  const { id: proposalId } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const newVote = await prisma.vote.create({
      data: {
        userId: userId,
        videoProposalId: proposalId,
      },
    });
    return NextResponse.json(newVote, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'You have already voted for this proposal.' }, { status: 409 });
    }
    console.error("Error creating vote:", error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: ParamsContext
) {
  const { id: proposalId } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    await prisma.vote.delete({
      where: {
        userId_videoProposalId: {
          userId,
          videoProposalId: proposalId,
        },
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Vote not found.' }, { status: 404 });
    }
    console.error("Error deleting vote:", error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
