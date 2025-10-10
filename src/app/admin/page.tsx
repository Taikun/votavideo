'use client';

import { useSession } from 'next-auth/react';
import CreateProposalForm from './CreateProposalForm';
import ManageProposalsList from './ManageProposalsList';
import CommunityModerationList from './CommunityModerationList';

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
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-8 text-3xl font-bold">Panel de administración</h1>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Moderar ideas de la comunidad</h2>
        <CommunityModerationList />
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Crear nueva propuesta</h2>
        <CreateProposalForm />
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Gestionar propuestas existentes</h2>
        <ManageProposalsList />
      </section>
    </div>
  );
}
