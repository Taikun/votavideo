"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 6;
const COMMUNITY_ENDPOINT = "/api/community-proposals";

export type CommunityProposal = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  hasVoted: boolean;
  createdAt: string;
  _count: {
    votes: number;
  };
};

type FetchResponse = {
  proposals: CommunityProposal[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export default function CommunityProposalsClient() {
  const { data: session } = useSession();
  const [proposals, setProposals] = useState<CommunityProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshToken, setRefreshToken] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const sessionUserId = session?.user?.id ?? null;
  const isAuthenticated = Boolean(sessionUserId);

  const loadProposals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${COMMUNITY_ENDPOINT}?page=${page}&pageSize=${PAGE_SIZE}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Error al cargar las propuestas");
      }

      const data = (await res.json()) as FetchResponse;

      const sanitizedTotalPages = Number.isFinite(data.totalPages) ? Math.max(1, data.totalPages) : 1;

      if (page > sanitizedTotalPages) {
        setTotalPages(sanitizedTotalPages);
        setPage(sanitizedTotalPages);
        return;
      }

      if (Array.isArray(data.proposals)) {
        setProposals(
          data.proposals.map((proposal) => ({
            ...proposal,
            hasVoted: Boolean(proposal.hasVoted),
          }))
        );
      } else {
        setProposals([]);
      }

      setTotalPages(sanitizedTotalPages);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar las propuestas.";
      setError(message);
      setProposals([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadProposals();
  }, [loadProposals, sessionUserId, refreshToken]);

  const handleVoteToggle = useCallback(
    async (proposalId: string, hasVoted: boolean) => {
      if (!isAuthenticated) {
        alert("Debes iniciar sesión para votar.");
        return;
      }

      setVoting(proposalId);

      try {
        const method = hasVoted ? "DELETE" : "POST";
        const res = await fetch(`/api/proposals/${proposalId}/vote`, {
          method,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: null }));
          throw new Error(body.error ?? "No se pudo actualizar tu voto.");
        }

        setProposals((prev) =>
          prev.map((proposal) =>
            proposal.id === proposalId
              ? {
                  ...proposal,
                  _count: { votes: Math.max(0, proposal._count.votes + (hasVoted ? -1 : 1)) },
                  hasVoted: !hasVoted,
                }
              : proposal
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Ocurrió un error al votar.";
        alert(message);
      } finally {
        setVoting(null);
      }
    },
    [isAuthenticated]
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!isAuthenticated) {
        setFormMessage("Debes iniciar sesión para enviar una propuesta.");
        return;
      }

      const trimmedTitle = title.trim();
      const trimmedDescription = description.trim();

      if (!trimmedTitle || !trimmedDescription) {
        setFormMessage("Por favor completa el título y la descripción.");
        return;
      }

      setSubmitting(true);
      setFormMessage(null);

      try {
        const res = await fetch(COMMUNITY_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: trimmedTitle, description: trimmedDescription }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: null }));
          throw new Error(body.error ?? "No se pudo guardar la propuesta.");
        }

        setTitle("");
        setDescription("");
        setFormMessage("¡Tu propuesta quedó pendiente de revisión. Te avisaremos cuando esté publicada!");
        setRefreshToken((token) => token + 1);
        setPage(1);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Ocurrió un error inesperado.";
        setFormMessage(message);
      } finally {
        setSubmitting(false);
      }
    },
    [description, isAuthenticated, title]
  );

  const canGoPrevious = useMemo(() => page > 1 && !loading, [page, loading]);
  const canGoNext = useMemo(() => page < totalPages && !loading, [page, totalPages, loading]);

  return (
    <div className="space-y-12">
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Comparte tu propuesta</h2>
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Título del vídeo
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={140}
                required
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                placeholder="¿Qué vídeo debería producir el canal?"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                ¿Por qué te gustaría verlo?
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                maxLength={500}
                required
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Explica brevemente la idea para motivar a la comunidad."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {submitting ? "Enviando..." : "Enviar propuesta"}
            </button>
            {formMessage && <p className="text-sm text-gray-600 dark:text-gray-300">{formMessage}</p>}
          </form>
        ) : (
          <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
            Inicia sesión para compartir tus ideas con la comunidad.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Propuestas de la comunidad</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Explora las ideas creadas por otros miembros y apoya tus favoritas.
        </p>

        {loading ? (
          <p className="mt-6 text-center text-gray-600 dark:text-gray-400">Cargando propuestas...</p>
        ) : error ? (
          <p className="mt-6 text-center text-red-500">{error}</p>
        ) : proposals.length === 0 ? (
          <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
            Aún no hay propuestas de la comunidad. ¡Sé la primera persona en compartir una!
          </p>
        ) : (
          <>
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {proposals.map((proposal) => {
                const hasVoted = proposal.hasVoted;
                const isVoting = voting === proposal.id;
                return (
                  <article
                    key={proposal.id}
                    className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="relative h-40 w-full bg-gradient-to-br from-blue-500 to-purple-600">
                      <Image
                        src={proposal.thumbnailUrl || "/community-placeholder.svg"}
                        alt={proposal.title}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{proposal.title}</h3>
                      <p className="mt-2 flex-1 text-sm text-gray-600 dark:text-gray-300">{proposal.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          {proposal._count.votes} votos
                        </span>
                        <button
                          onClick={() => handleVoteToggle(proposal.id, hasVoted)}
                          disabled={!isAuthenticated || isVoting}
                          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                          {isVoting ? "Procesando..." : hasVoted ? "Quitar voto" : "Apoyar"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={!canGoPrevious}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Anterior
                </button>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={!canGoNext}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
