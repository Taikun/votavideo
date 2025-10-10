"use client";

import { useCallback, useEffect, useState } from "react";

type CommunityProposal = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: "PENDING" | "VOTING" | "PUBLISHED";
  createdBy: {
    name: string | null;
    email: string | null;
  } | null;
};

const isCommunityProposalArray = (data: unknown): data is CommunityProposal[] => {
  return (
    Array.isArray(data) &&
    data.every((item) => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const proposal = item as Partial<CommunityProposal>;

      const hasValidStatus =
        proposal.status === "PENDING" || proposal.status === "VOTING" || proposal.status === "PUBLISHED";

      return (
        typeof proposal.id === "string" &&
        typeof proposal.title === "string" &&
        typeof proposal.description === "string" &&
        typeof proposal.createdAt === "string" &&
        hasValidStatus &&
        (proposal.createdBy === null ||
          (proposal.createdBy &&
            typeof proposal.createdBy === "object" &&
            (proposal.createdBy.name === null || typeof proposal.createdBy.name === "string") &&
            (proposal.createdBy.email === null || typeof proposal.createdBy.email === "string")))
      );
    })
  );
};

export default function CommunityModerationList() {
  const [proposals, setProposals] = useState<CommunityProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/community-proposals/admin");
      if (!res.ok) {
        throw new Error("No se pudieron cargar las propuestas de la comunidad.");
      }
      const data: unknown = await res.json();
      if (!isCommunityProposalArray(data)) {
        throw new Error("Formato de respuesta inesperado");
      }

      setProposals(data.filter((proposal) => proposal.status === "PENDING"));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ocurrió un error al cargar las propuestas.";
      setError(message);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const handleApprove = async (proposalId: string) => {
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "VOTING" }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "No se pudo aprobar la propuesta" }));
        throw new Error(body.error || "No se pudo aprobar la propuesta");
      }

      fetchProposals();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ocurrió un error al aprobar la propuesta.";
      alert(`Error: ${message}`);
    }
  };

  const handleDelete = async (proposalId: string) => {
    const confirmDelete = window.confirm("¿Seguro que quieres eliminar esta propuesta?");
    if (!confirmDelete) {
      return;
    }

    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "No se pudo eliminar la propuesta" }));
        throw new Error(body.error || "No se pudo eliminar la propuesta");
      }

      fetchProposals();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ocurrió un error al eliminar la propuesta.";
      alert(`Error: ${message}`);
    }
  };

  const handleEdit = async (proposal: CommunityProposal) => {
    const newTitle = window.prompt("Nuevo título", proposal.title);
    if (newTitle === null) {
      return;
    }

    const trimmedTitle = newTitle.trim();
    if (trimmedTitle.length === 0) {
      alert("El título no puede quedar vacío.");
      return;
    }

    const newDescription = window.prompt("Nueva descripción", proposal.description);
    if (newDescription === null) {
      return;
    }

    const trimmedDescription = newDescription.trim();
    if (trimmedDescription.length === 0) {
      alert("La descripción no puede quedar vacía.");
      return;
    }

    try {
      const res = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle, description: trimmedDescription }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "No se pudo actualizar la propuesta" }));
        throw new Error(body.error || "No se pudo actualizar la propuesta");
      }

      fetchProposals();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ocurrió un error al actualizar la propuesta.";
      alert(`Error: ${message}`);
    }
  };

  if (loading) {
    return <p>Cargando propuestas de la comunidad...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (proposals.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay propuestas pendientes de revisión.</p>;
  }

  return (
    <div className="space-y-4">
      {proposals.map((proposal) => (
        <div
          key={proposal.id}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{proposal.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{proposal.description}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Creada por {proposal.createdBy?.name ?? proposal.createdBy?.email ?? "Usuario anónimo"}
                {proposal.createdBy?.email && proposal.createdBy?.name ? ` · ${proposal.createdBy.email}` : ""}
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Enviada el {new Date(proposal.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(proposal)}
                className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
              >
                Editar
              </button>
              <button
                onClick={() => handleApprove(proposal.id)}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Admitir
              </button>
              <button
                onClick={() => handleDelete(proposal.id)}
                className="rounded-md bg-red-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
