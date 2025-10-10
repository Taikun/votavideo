import Link from "next/link";
import AuthButton from "../AuthButton";
import CommunityProposalsClient from "./CommunityProposalsClient";

export default function CommunityProposalsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-20">
      <header className="w-full max-w-5xl flex justify-between items-center font-mono text-sm">
        <div>
          <h1 className="text-2xl font-bold">Propuestas de la comunidad</h1>
          <p className="text-sm font-medium text-muted-foreground">
            Sumemos ideas para los próximos vídeos del canal.
          </p>
        </div>
        <nav className="flex gap-4 items-center">
          <Link href="/" className="text-sm font-medium hover:underline">
            Inicio
          </Link>
          <Link href="/published" className="text-sm font-medium hover:underline">
            Vídeos Publicados
          </Link>
          <AuthButton />
        </nav>
      </header>

      <section className="mt-14 w-full max-w-4xl">
        <CommunityProposalsClient />
      </section>
    </main>
  );
}
