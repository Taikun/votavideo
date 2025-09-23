import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_PAGE_SIZE = 6;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pageParam = url.searchParams.get('page');
    const pageSizeParam = url.searchParams.get('pageSize');

    const parsedPage = pageParam ? parseInt(pageParam, 10) : NaN;
    const parsedPageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : NaN;

    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const pageSize = Number.isFinite(parsedPageSize) && parsedPageSize > 0 ? parsedPageSize : DEFAULT_PAGE_SIZE;

    const skip = (page - 1) * pageSize;

    const [publishedVideos, total] = await Promise.all([
      prisma.videoProposal.findMany({
        where: {
          status: 'PUBLISHED',
        },
        orderBy: {
          updatedAt: 'desc', // Order by when they were published
        },
        skip,
        take: pageSize,
      }),
      prisma.videoProposal.count({
        where: {
          status: 'PUBLISHED',
        },
      }),
    ]);

    return NextResponse.json({
      videos: publishedVideos,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error) {
    console.error("Error fetching published videos:", error);
    return NextResponse.json({ error: 'Error fetching published videos' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
