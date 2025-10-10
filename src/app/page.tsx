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
    take: 6,
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

      <section className="w-full max-w-5xl space-y-10">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Ideas Comunidad</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Así va la inspiración de la comunidad. Las más recientes aparecen aquí.
              </p>
            </div>
            <Link href="/community-proposals" className="text-xs font-semibold text-blue-600 hover:underline">
              Ver todas
            </Link>
          </div>
          {recentCommunityProposals.length === 0 ? (
            <p className="mt-6 text-sm text-gray-600 dark:text-gray-300">
              Aún no hay propuestas de la comunidad. ¡Publica la primera idea!
            </p>
          ) : (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentCommunityProposals.map((proposal) => (
                <li
                  key={proposal.id}
                  className="rounded-lg border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4 text-sm font-semibold text-gray-800 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-gray-700 dark:from-gray-900 dark:to-gray-800 dark:text-gray-100"
                >
                  {proposal.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <VideoProposalList />
        </div>
      </section>
    </main>
  );
}
