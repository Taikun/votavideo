import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;

    const [proposals, userVotes] = await Promise.all([
      prisma.videoProposal.findMany({
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
      }),
      userId
        ? prisma.vote.findMany({
            where: { userId },
            select: { videoProposalId: true },
          })
        : Promise.resolve<{ videoProposalId: string }[]>([]),
    ]);

    const votedProposalIds = new Set(userVotes.map(vote => vote.videoProposalId));

    const proposalsWithVoteStatus = proposals.map(proposal => ({
      ...proposal,
      hasVoted: votedProposalIds.has(proposal.id),
    }));

    return NextResponse.json(proposalsWithVoteStatus);
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
