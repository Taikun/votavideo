'use client';

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export type VideoProposal = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  _count: {
    votes: number;
  };
  hasVoted: boolean;
};

const PAGE_SIZE = 6;

export default function VideoProposalList() {
  const { data: session } = useSession();
  const [proposals, setProposals] = useState<VideoProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const sessionUserId = session?.user?.id ?? null;

  useEffect(() => {
    let isMounted = true;

    const fetchProposals = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/proposals?page=${page}&pageSize=${PAGE_SIZE}`);

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Error al cargar las propuestas.');
        }

        const data = await res.json();

        if (isMounted) {
          const sanitizedTotalPages = typeof data.totalPages === 'number' ? Math.max(1, data.totalPages) : 1;

          if (page > sanitizedTotalPages) {
            setTotalPages(sanitizedTotalPages);
            setPage(sanitizedTotalPages);
            return;
          }

          if (Array.isArray(data.proposals)) {
            setProposals(
              data.proposals.map((proposal: VideoProposal) => ({
                ...proposal,
                hasVoted: Boolean(proposal.hasVoted),
              }))
            );
          } else {
            setProposals([]);
          }

          setTotalPages(sanitizedTotalPages);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Error al cargar las propuestas.';
          setError(message);
          setProposals([]);
          setTotalPages(1);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProposals();

    return () => {
      isMounted = false;
    };
  }, [page, sessionUserId]);

  const handleVoteToggle = async (proposalId: string, hasVoted: boolean) => {
    if (!session) {
      alert("Debes iniciar sesión para votar.");
      return;
    }

    setVoting(proposalId);

    try {
      const method = hasVoted ? 'DELETE' : 'POST';
      const res = await fetch(`/api/proposals/${proposalId}/vote`, {
        method,
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || (hasVoted ? 'Failed to remove vote' : 'Failed to vote'));
      }

      // Update UI to reflect the new vote status
      setProposals(prevProposals =>
        prevProposals.map(p =>
          p.id === proposalId
            ? {
                ...p,
                _count: { votes: Math.max(0, p._count.votes + (hasVoted ? -1 : 1)) },
                hasVoted: !hasVoted,
              }
            : p
        )
      );

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Ocurrió un error al votar.";
      alert(message);
    } finally {
      setVoting(null);
    }
  };

  if (loading) {
    return <p className="text-center">Cargando propuestas...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (proposals.length === 0) {
    return <p className="text-center">No hay propuestas para votar en este momento.</p>;
  }

  return (
    <>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {proposals.map(proposal => {
          const hasVoted = proposal.hasVoted;
          const isVoting = voting === proposal.id;

          return (
            <div key={proposal.id} className="border rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-800">
              <Image
                src={proposal.thumbnailUrl}
                alt={proposal.title}
                width={400}
                height={300}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-bold">{proposal.title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{proposal.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="font-bold text-lg">{proposal._count.votes} Votos</span>
                  <button
                    onClick={() => handleVoteToggle(proposal.id, hasVoted)}
                    disabled={!session || isVoting}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
                  >
                    {isVoting ? 'Procesando...' : hasVoted ? 'Quitar voto' : 'Votar'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Anterior
          </button>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Siguiente
          </button>
        </div>
      )}
    </>
  );
}
