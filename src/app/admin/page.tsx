'use client';

import { useSession } from 'next-auth/react';
import CreateProposalForm from './CreateProposalForm';
import ManageProposalsList from './ManageProposalsList';

export default function AdminPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Create New Proposal</h2>
        <CreateProposalForm />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Manage Existing Proposals</h2>
        <ManageProposalsList />
      </section>
    </div>
  );
}
