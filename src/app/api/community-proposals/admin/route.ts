import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const proposals = await prisma.videoProposal.findMany({
      where: {
        isCommunity: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error("Error fetching community proposals for admin:", error);
    return NextResponse.json({ error: "Error fetching proposals" }, { status: 500 });
  }
}

export const runtime = "nodejs";

