'use client';

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
};

export default function VideoProposalList() {
  const { data: session } = useSession();
  const [proposals, setProposals] = useState<VideoProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [votedProposalIds, setVotedProposalIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/proposals')
      .then(res => {
        if (!res.ok) {
          // If the response is not OK, parse the error body and throw it
          return res.json().then(errorBody => {
            throw new Error(errorBody.error || 'Failed to fetch proposals');
          });
        }
        return res.json();
      })
      .then(data => {
        // Ensure the data is an array before setting it
        if (Array.isArray(data)) {
          setProposals(data);
        } else {
          // If data is not an array, log an error and don't update the state
          console.error("API did not return an array for proposals:", data);
        }
      })
      .catch(error => {
        console.error("Error fetching proposals:", error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleVote = async (proposalId: string) => {
    if (!session) {
      alert("Debes iniciar sesión para votar.");
      return;
    }

    setVoting(proposalId);

    try {
      const res = await fetch(`/api/proposals/${proposalId}/vote`, {
        method: 'POST',
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to vote');
      }

      // Update UI to reflect the new vote
      setProposals(prevProposals =>
        prevProposals.map(p =>
          p.id === proposalId ? { ...p, _count: { votes: p._count.votes + 1 } } : p
        )
      );
      setVotedProposalIds(prev => new Set(prev).add(proposalId));

    } catch (error: any) {
      alert(error.message || "Ocurrió un error al votar.");
    } finally {
      setVoting(null);
    }
  };

  if (loading) {
    return <p className="text-center">Cargando propuestas...</p>;
  }

  if (proposals.length === 0) {
    return <p className="text-center">No hay propuestas para votar en este momento.</p>;
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {proposals.map(proposal => {
        const hasVoted = votedProposalIds.has(proposal.id);
        const isVoting = voting === proposal.id;

        return (
          <div key={proposal.id} className="border rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-800">
            <img src={proposal.thumbnailUrl} alt={proposal.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-bold">{proposal.title}</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">{proposal.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="font-bold text-lg">{proposal._count.votes} Votos</span>
                <button
                  onClick={() => handleVote(proposal.id)}
                  disabled={!session || isVoting || hasVoted}
                  className="bg-blue-500 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
                >
                  {hasVoted ? '¡Votado!' : isVoting ? 'Votando...' : 'Votar'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}