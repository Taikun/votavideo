import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const DEFAULT_PAGE_SIZE = 6;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;

    const url = new URL(request.url);
    const pageParam = url.searchParams.get('page');
    const pageSizeParam = url.searchParams.get('pageSize');

    const parsedPage = pageParam ? parseInt(pageParam, 10) : NaN;
    const parsedPageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : NaN;

    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const pageSize = Number.isFinite(parsedPageSize) && parsedPageSize > 0 ? parsedPageSize : DEFAULT_PAGE_SIZE;

    const skip = (page - 1) * pageSize;

    const [proposals, userVotes, total] = await Promise.all([
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
        skip,
        take: pageSize,
      }),
      userId
        ? prisma.vote.findMany({
            where: { userId },
            select: { videoProposalId: true },
          })
        : Promise.resolve<{ videoProposalId: string }[]>([]),
      prisma.videoProposal.count({
        where: {
          status: 'VOTING',
        },
      }),
    ]);

    const votedProposalIds = new Set(userVotes.map(vote => vote.videoProposalId));

    const proposalsWithVoteStatus = proposals.map(proposal => ({
      ...proposal,
      hasVoted: votedProposalIds.has(proposal.id),
    }));

    return NextResponse.json({
      proposals: proposalsWithVoteStatus,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
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

export const runtime = 'nodejs';
