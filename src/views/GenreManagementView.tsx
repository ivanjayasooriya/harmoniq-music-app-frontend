import React, { useEffect, useState } from 'react';
import { Plus, Tag, Trash2, X } from 'lucide-react';
import { api } from '../services/api';
import { Genre } from '../types';

export const GenreManagementView: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorScheme, setColorScheme] = useState('from-indigo-600 to-purple-600');

  const fetchGenres = async () => {
    const list = await api.genres.getAll();
    setGenres(list);
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const colorPresets = [
    { label: 'Indigo / Purple', val: 'from-indigo-600 to-purple-600' },
    { label: 'Emerald / Teal', val: 'from-emerald-500 to-teal-700' },
    { label: 'Fuchsia / Indigo', val: 'from-fuchsia-600 to-indigo-600' },
    { label: 'Amber / Rose', val: 'from-amber-500 to-rose-600' },
    { label: 'Pink / Purple', val: 'from-pink-500 to-purple-600' },
    { label: 'Cyan / Blue', val: 'from-cyan-500 to-blue-700' },
    { label: 'Red / Orange', val: 'from-red-600 to-orange-700' },
    { label: 'Teal / Emerald', val: 'from-teal-400 to-emerald-600' },
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const created = await api.genres.create({
      name: name.trim(),
      description: description.trim() || 'Curated category on SoundWave.',
      color: colorScheme,
    });
    setGenres([...genres, created]);
    setName('');
    setDescription('');
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this genre?')) return;
    await api.genres.delete(id);
    setGenres(genres.filter((g) => g.id !== id));
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Tag className="w-7 h-7 text-purple-400" />
            Genre & Mood Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure music taxonomies, colors, and category tags
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Genre</span>
        </button>
      </div>

      {/* Grid of Genres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {genres.map((genre) => (
          <div
            key={genre.id}
            className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition"
          >
            <div>
              <div className="flex items-center justify-between">
                <div
                  className={`w-7 h-7 rounded-lg bg-gradient-to-br ${genre.color} shadow-sm`}
                />
                <button
                  onClick={() => handleDelete(genre.id)}
                  className="p-1 rounded text-zinc-500 hover:text-rose-400 transition"
                  title="Delete genre"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-bold text-base text-white mt-3">{genre.name}</h3>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{genre.description}</p>
            </div>

            <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>{genre.trackCount.toLocaleString()} songs</span>
              <span className="text-[10px] text-zinc-500 uppercase font-sans">Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Genre Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-lg text-white">Add New Music Genre</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Genre Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cyberpunk Industrial"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Atmosphere and sonic style..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Gradient Color Palette
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setColorScheme(preset.val)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs transition border ${
                        colorScheme === preset.val
                          ? 'border-purple-500 bg-purple-500/10 text-white font-semibold'
                          : 'border-zinc-800 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${preset.val}`} />
                      <span className="truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow-lg shadow-purple-600/20"
                >
                  Create Genre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
