'use client';

import { useEffect, useState } from 'react';

type Proposal = {
  id: string;
  title: string;
  status: 'VOTING' | 'PUBLISHED';
  publishedUrl: string | null;
  _count: {
    votes: number;
  };
};

const isProposalArray = (data: unknown): data is Proposal[] => {
  return (
    Array.isArray(data) &&
    data.every((item) => {
      if (!item || typeof item !== 'object') {
        return false;
      }

      const proposal = item as Partial<Proposal> & { _count?: { votes?: unknown } };
      return (
        typeof proposal.id === 'string' &&
        typeof proposal.title === 'string' &&
        (proposal.status === 'VOTING' || proposal.status === 'PUBLISHED') &&
        ('publishedUrl' in proposal ? proposal.publishedUrl === null || typeof proposal.publishedUrl === 'string' : true) &&
        typeof proposal._count?.votes === 'number'
      );
    })
  );
};

export default function ManageProposalsList() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proposals/all');
      if (!res.ok) throw new Error('Failed to fetch proposals');
      const data: unknown = await res.json();
      if (!isProposalArray(data)) {
        throw new Error('Formato de respuesta inesperado.');
      }
      setProposals(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error al cargar las propuestas.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleMarkAsPublished = async (proposalId: string) => {
    const publishedUrl = window.prompt("Introduce la URL final del vídeo (opcional, por ejemplo enlace de YouTube):");
    if (publishedUrl === null) {
      return; // User cancelled the action entirely
    }

    const sanitizedUrl = publishedUrl.trim();

    try {
      const res = await fetch(`/api/proposals/${proposalId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'PUBLISHED',
            publishedUrl: sanitizedUrl.length > 0 ? sanitizedUrl : null,
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to update proposal');
      }

      // Refresh the list to show the change
      fetchProposals();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
      alert(`Error: ${message}`);
    }
  };

  const handleDeleteProposal = async (proposalId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this proposal?');
    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Failed to delete proposal' }));
        throw new Error(body.error || 'Failed to delete proposal');
      }

      fetchProposals();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error al eliminar la propuesta.';
      alert(`Error: ${message}`);
    }
  };

  if (loading) return <p>Loading proposals...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      {proposals.map((p) => (
        <div key={p.id} className="flex justify-between items-center p-4 border rounded-lg bg-white dark:bg-gray-800">
          <div>
            <h3 className="font-bold">{p.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Votes: {p._count.votes} | Status: <span className={p.status === 'PUBLISHED' ? 'text-green-500' : 'text-yellow-500'}>{p.status}</span>
            </p>
          </div>
          <div className="flex gap-2">
            {p.status === 'VOTING' && (
              <button
                onClick={() => handleMarkAsPublished(p.id)}
                className="bg-green-500 text-white font-semibold py-1 px-3 rounded hover:bg-green-600 transition-colors"
              >
                Mark as Published
              </button>
            )}
            <button
              onClick={() => handleDeleteProposal(p.id)}
              className="bg-red-500 text-white font-semibold py-1 px-3 rounded hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
