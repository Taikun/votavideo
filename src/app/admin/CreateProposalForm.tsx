'use client';

import { useState } from 'react';

export default function CreateProposalForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, thumbnailUrl }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to create proposal');
      }

      setMessage('Proposal created successfully!');
      // Clear form
      setTitle('');
      setDescription('');
      setThumbnailUrl('');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
      setMessage(`Error: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Thumbnail URL</label>
        <input
          type="url"
          id="thumbnailUrl"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Creating...' : 'Create Proposal'}
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </form>
  );
}
