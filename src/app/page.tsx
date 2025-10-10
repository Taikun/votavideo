import AuthButton from "./AuthButton";
import VideoProposalList from "./VideoProposalList";
import Link from "next/link";
import { channelName, channelUrl } from "@/lib/channel";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const recentCommunityProposals = await prisma.videoProposal.findMany({
    where: {
      isCommunity: true,
      status: "VOTING",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
    select: {
      id: true,
      title: true,
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-20">
      <header className="w-full max-w-5xl flex justify-between items-center font-mono text-sm">
        <div>
          <h1 className="text-2xl font-bold">VotaVideo</h1>
          {channelName && channelUrl ? (
            <Link
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-500 hover:underline"
            >
              {channelName}
            </Link>
          ) : channelName ? (
            <p className="text-sm font-medium text-muted-foreground">{channelName}</p>
          ) : null}
        </div>
        <nav className="flex gap-4 items-center">
          <Link href="/community-proposals" className="text-sm font-medium hover:underline">Propuestas de la comunidad</Link>
          <Link href="/published" className="text-sm font-medium hover:underline">Vídeos Publicados</Link>
          <AuthButton />
        </nav>
      </header>

      <section className="my-16 text-center">
        <h2 className="text-4xl font-bold">Propuestas de Vídeos</h2>
        <p className="text-muted-foreground mt-2">Vota por el vídeo que quieres ver a continuación.</p>
      </section>

      <section className="w-full max-w-5xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="flex-1">
            <VideoProposalList />
          </div>
          <aside className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:w-80">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Ideas Comunidad
              </h3>
              <Link href="/community-proposals" className="text-xs font-medium text-blue-600 hover:underline">
                Ver todas
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {recentCommunityProposals.length === 0 ? (
                <li className="text-sm text-gray-600 dark:text-gray-300">
                  Aún no hay propuestas de la comunidad.
                </li>
              ) : (
                recentCommunityProposals.map((proposal) => (
                  <li
                    key={proposal.id}
                    className="rounded-md border border-transparent bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 transition hover:border-gray-200 hover:bg-white dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-700 dark:hover:bg-gray-800/80"
                  >
                    {proposal.title}
                  </li>
                ))
              )}
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
