import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


type ParamsContext = { params: Promise<{ id: string }> };

export async function PUT(
  request: Request,
  context: ParamsContext
) {
  const { id: proposalId } = await context.params;
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { status, publishedUrl } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Missing status field' }, { status: 400 });
    }
    
    if (status === 'PUBLISHED' && !publishedUrl) {
        return NextResponse.json({ error: 'publishedUrl is required when marking as published' }, { status: 400 });
    }

    const updatedProposal = await prisma.videoProposal.update({
      where: { id: proposalId },
      data: {
        status,
        publishedUrl,
      },
    });

    return NextResponse.json(updatedProposal);
  } catch (error) {
    console.error(`Error updating proposal ${proposalId}:`, error);
    return NextResponse.json({ error: 'Error updating proposal' }, { status: 500 });
  }
}
