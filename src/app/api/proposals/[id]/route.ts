import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { VideoStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';


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
    const body = await request.json();

    const rawStatus = (body as { status?: unknown }).status;
    const rawTitle = (body as { title?: unknown }).title;
    const rawDescription = (body as { description?: unknown }).description;
    const rawPublishedUrl = (body as { publishedUrl?: unknown }).publishedUrl;

    const updateData: {
      status?: VideoStatus;
      publishedUrl?: string | null;
      title?: string;
      description?: string;
    } = {};

    if (rawStatus !== undefined) {
      if (typeof rawStatus !== 'string' || !Object.values(VideoStatus).includes(rawStatus as VideoStatus)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }
      updateData.status = rawStatus as VideoStatus;

      if (rawPublishedUrl === undefined && updateData.status === VideoStatus.PUBLISHED) {
        updateData.publishedUrl = null;
      }
    }

    if (rawPublishedUrl !== undefined) {
      if (rawPublishedUrl === null) {
        updateData.publishedUrl = null;
      } else if (typeof rawPublishedUrl === 'string') {
        const trimmed = rawPublishedUrl.trim();
        updateData.publishedUrl = trimmed.length > 0 ? trimmed : null;
      } else {
        return NextResponse.json({ error: 'Invalid publishedUrl value' }, { status: 400 });
      }
    }

    if (rawTitle !== undefined) {
      if (typeof rawTitle !== 'string' || rawTitle.trim().length === 0) {
        return NextResponse.json({ error: 'El título no puede quedar vacío.' }, { status: 400 });
      }
      updateData.title = rawTitle.trim();
    }

    if (rawDescription !== undefined) {
      if (typeof rawDescription !== 'string' || rawDescription.trim().length === 0) {
        return NextResponse.json({ error: 'La descripción no puede quedar vacía.' }, { status: 400 });
      }
      updateData.description = rawDescription.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No se proporcionaron cambios.' }, { status: 400 });
    }

    const updatedProposal = await prisma.videoProposal.update({
      where: { id: proposalId },
      data: updateData,
      include: {
        _count: {
          select: { votes: true },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProposal);
  } catch (error) {
    console.error(`Error updating proposal ${proposalId}:`, error);
    return NextResponse.json({ error: 'Error updating proposal' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: ParamsContext
) {
  const { id: proposalId } = await context.params;
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.videoProposal.delete({
      where: { id: proposalId },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error(`Error deleting proposal ${proposalId}:`, error);

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Error deleting proposal' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
