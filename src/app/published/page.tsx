'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type PublishedVideo = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedUrl: string | null;
};

export default function PublishedPage() {
  const [videos, setVideos] = useState<PublishedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/published')
      .then((res) => res.json())
      .then((data) => {
        setVideos(data);
        setLoading(false);
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-20">
      <header className="w-full max-w-5xl flex justify-between items-center font-mono text-sm">
        <h1 className="text-2xl font-bold"><Link href="/">VotaVideo</Link></h1>
        <Link href="/" className="text-sm font-medium hover:underline">← Volver a Votaciones</Link>
      </header>

      <section className="my-16 text-center">
        <h2 className="text-4xl font-bold">Vídeos Publicados</h2>
        <p className="text-muted-foreground mt-2">Aquí están los vídeos que ya se han completado gracias a vuestros votos.</p>
      </section>

      <section className="w-full max-w-5xl">
        {loading ? (
          <p className="text-center">Cargando vídeos...</p>
        ) : videos.length === 0 ? (
          <p className="text-center">Aún no hay vídeos publicados.</p>
        ) : (
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
        )}
      </section>
    </main>
  );
}
