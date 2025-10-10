'use client';

import { useEffect, useState } from 'react';

type Proposal = {
  id: string;
  title: string;
  status: 'PENDING' | 'VOTING' | 'PUBLISHED';
  publishedUrl: string | null;
  isCommunity: boolean;
  description: string;
  createdBy: {
    name: string | null;
    email: string | null;
  } | null;
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
        typeof proposal.description === 'string' &&
        (
          proposal.status === 'PENDING' ||
          proposal.status === 'VOTING' ||
          proposal.status === 'PUBLISHED'
        ) &&
        ('publishedUrl' in proposal ? proposal.publishedUrl === null || typeof proposal.publishedUrl === 'string' : true) &&
        typeof proposal._count?.votes === 'number' &&
        typeof proposal.isCommunity === 'boolean' &&
        (proposal.createdBy === null ||
          (proposal.createdBy &&
            typeof proposal.createdBy === 'object' &&
            (proposal.createdBy.name === null || typeof proposal.createdBy.name === 'string') &&
            (proposal.createdBy.email === null || typeof proposal.createdBy.email === 'string')))
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
      setProposals(
        data.filter((proposal) => !(proposal.isCommunity && proposal.status === 'PENDING'))
      );
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

  const handleEditProposal = async (proposal: Proposal) => {
    const newTitle = window.prompt('Nuevo título para la propuesta:', proposal.title);
    if (newTitle === null) {
      return;
    }

    const trimmedTitle = newTitle.trim();
    if (trimmedTitle.length === 0) {
      alert('El título no puede quedar vacío.');
      return;
    }

    const newDescription = window.prompt('Nueva descripción para la propuesta:', proposal.description ?? '');
    if (newDescription === null) {
      return;
    }

    const trimmedDescription = newDescription.trim();
    if (trimmedDescription.length === 0) {
      alert('La descripción no puede quedar vacía.');
      return;
    }

    try {
      const res = await fetch(`/api/proposals/${proposal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDescription,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'No se pudo actualizar la propuesta.' }));
        throw new Error(body.error || 'No se pudo actualizar la propuesta.');
      }

      fetchProposals();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error al actualizar la propuesta.';
      alert(`Error: ${message}`);
    }
  };

  if (loading) return <p>Loading proposals...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      {proposals.map((p) => (
        <div key={p.id} className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{p.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{p.description}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Estado: <span className={p.status === 'PUBLISHED' ? 'text-green-500' : p.status === 'PENDING' ? 'text-yellow-500' : 'text-blue-500'}>{p.status}</span>
              {' · '}Votos: {p._count.votes}
            </p>
            {p.isCommunity && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Creada por {p.createdBy?.name || p.createdBy?.email || 'Usuario anónimo'}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleEditProposal(p)}
              className="rounded bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            >
              Editar
            </button>
            {p.status === 'VOTING' && (
              <button
                onClick={() => handleMarkAsPublished(p.id)}
                className="rounded bg-green-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-green-600"
              >
                Mark as Published
              </button>
            )}
            <button
              onClick={() => handleDeleteProposal(p.id)}
              className="rounded bg-red-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
