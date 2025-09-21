import AuthButton from "./AuthButton";
import VideoProposalList from "./VideoProposalList";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-20">
      <header className="w-full max-w-5xl flex justify-between items-center font-mono text-sm">
        <h1 className="text-2xl font-bold">VotaVideo</h1>
        <nav className="flex gap-4 items-center">
          <Link href="/published" className="text-sm font-medium hover:underline">Vídeos Publicados</Link>
          <AuthButton />
        </nav>
      </header>

      <section className="my-16 text-center">
        <h2 className="text-4xl font-bold">Propuestas de Vídeos</h2>
        <p className="text-muted-foreground mt-2">Vota por el vídeo que quieres ver a continuación.</p>
      </section>

      <section className="w-full max-w-5xl">
        <VideoProposalList />
      </section>
    </main>
  );
}