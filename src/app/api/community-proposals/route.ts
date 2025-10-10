import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VideoStatus } from "@prisma/client";

const DEFAULT_PAGE_SIZE = 6;
const COMMUNITY_PLACEHOLDER = "/community-placeholder.svg";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;

    const url = new URL(request.url);
    const pageParam = url.searchParams.get("page");
    const pageSizeParam = url.searchParams.get("pageSize");

    const parsedPage = pageParam ? parseInt(pageParam, 10) : NaN;
    const parsedPageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : NaN;

    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const pageSize = Number.isFinite(parsedPageSize) && parsedPageSize > 0 ? parsedPageSize : DEFAULT_PAGE_SIZE;
    const skip = (page - 1) * pageSize;

    const [proposals, userVotes, total] = await Promise.all([
      prisma.videoProposal.findMany({
        where: {
          status: "VOTING",
          isCommunity: true,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          _count: {
            select: { votes: true },
          },
        },
        orderBy: {
          createdAt: "desc",
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
          status: "VOTING",
          isCommunity: true,
        },
      }),
    ]);

    const votedProposalIds = new Set(userVotes.map((vote) => vote.videoProposalId));

    const proposalsWithVoteStatus = proposals.map((proposal) => ({
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
    console.error("Error fetching community proposals:", error);
    return NextResponse.json({ error: "Error fetching proposals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const rawTitle = typeof body.title === "string" ? body.title.trim() : "";
    const rawDescription = typeof body.description === "string" ? body.description.trim() : "";

    if (!rawTitle || !rawDescription) {
      return NextResponse.json({ error: "Título y descripción son obligatorios." }, { status: 400 });
    }

    const newProposal = await prisma.videoProposal.create({
      data: {
        title: rawTitle,
        description: rawDescription,
        thumbnailUrl: COMMUNITY_PLACEHOLDER,
        isCommunity: true,
        status: VideoStatus.PENDING,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: { votes: true },
        },
      },
    });

    return NextResponse.json(newProposal, { status: 201 });
  } catch (error) {
    console.error("Error creating community proposal:", error);
    return NextResponse.json({ error: "Error creating proposal" }, { status: 500 });
  }
}

export const runtime = "nodejs";
