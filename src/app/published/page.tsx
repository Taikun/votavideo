'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { channelName, channelUrl } from '@/lib/channel';

type PublishedVideo = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedUrl: string | null;
};

const PAGE_SIZE = 6;

export default function PublishedPage() {
  const [videos, setVideos] = useState<PublishedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let isMounted = true;

    const fetchPublishedVideos = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/published?page=${page}&pageSize=${PAGE_SIZE}`);

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Error al cargar los vídeos publicados.');
        }

        const data = await res.json();

        if (isMounted) {
          const sanitizedTotalPages = typeof data.totalPages === 'number' ? Math.max(1, data.totalPages) : 1;

          if (page > sanitizedTotalPages) {
            setTotalPages(sanitizedTotalPages);
            setPage(sanitizedTotalPages);
            return;
          }

          setVideos(Array.isArray(data.videos) ? data.videos : []);
          setTotalPages(sanitizedTotalPages);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Error al cargar los vídeos publicados.';
          setError(message);
          setVideos([]);
          setTotalPages(1);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPublishedVideos();

    return () => {
      isMounted = false;
    };
  }, [page]);

  const handlePrevious = () => {
    setPage(prev => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setPage(prev => Math.min(totalPages, prev + 1));
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-20">
      <header className="w-full max-w-5xl flex justify-between items-center font-mono text-sm">
        <div>
          <h1 className="text-2xl font-bold"><Link href="/">VotaVideo</Link></h1>
          {channelName && channelUrl ? (
            <Link
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              {channelName}
            </Link>
          ) : channelName ? (
            <p className="text-xs text-muted-foreground">{channelName}</p>
          ) : null}
        </div>
        <Link href="/" className="text-sm font-medium hover:underline">← Volver a Votaciones</Link>
      </header>

      <section className="my-16 text-center">
        <h2 className="text-4xl font-bold">Vídeos Publicados</h2>
        <p className="text-muted-foreground mt-2">Aquí están los vídeos que ya se han completado gracias a vuestros votos.</p>
      </section>

      <section className="w-full max-w-5xl">
        {loading ? (
          <p className="text-center">Cargando vídeos...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : videos.length === 0 ? (
          <p className="text-center">Aún no hay vídeos publicados.</p>
        ) : (
          <>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <a 
                  key={video.id} 
                  href={video.publishedUrl || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="border rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-800 block hover:shadow-2xl transition-shadow"
                >
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-bold">{video.title}</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">{video.description}</p>
                    <span className="mt-4 inline-block text-blue-500 font-semibold hover:underline">
                      Ver Vídeo →
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={handlePrevious}
                  disabled={page === 1}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Anterior
                </button>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={handleNext}
                  disabled={page === totalPages}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
