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

export default function ManageProposalsList() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proposals/all');
      if (!res.ok) throw new Error('Failed to fetch proposals');
      const data = await res.json();
      setProposals(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleMarkAsPublished = async (proposalId: string) => {
    const publishedUrl = window.prompt("Enter the final video URL (e.g., YouTube link):");
    if (!publishedUrl) {
      return; // User cancelled
    }

    try {
      const res = await fetch(`/api/proposals/${proposalId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'PUBLISHED', publishedUrl }),
        }
      );

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to update proposal');
      }

      // Refresh the list to show the change
      fetchProposals();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
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
          {p.status === 'VOTING' && (
            <button
              onClick={() => handleMarkAsPublished(p.id)}
              className="bg-green-500 text-white font-semibold py-1 px-3 rounded hover:bg-green-600 transition-colors"
            >
              Mark as Published
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
