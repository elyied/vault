'use client';

import { useAuth } from '@/lib/auth';
import { getEntries, updateEntry, deleteEntry } from '@/lib/db';
import { searchEntries } from '@/lib/search';
import { DiaryEntry, SearchFilters, ViewMode } from '@/types';
import { EntryCard } from '@/components/feed/entry-card';
import { useEffect, useState, useCallback } from 'react';
import {
    Search,
    LayoutGrid,
    LayoutList,
    SlidersHorizontal,
    BookOpen,
    PenSquare,
    X,
    Image as ImageIcon,
    Heart,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const viewParam = searchParams.get('view');

    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({
        query: '',
        tags: [],
        mediaOnly: false,
        favoritesOnly: viewParam === 'favorites',
    });

    const loadEntries = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { entries: data } = await getEntries(user.uid, 100);
            setEntries(data);
        } catch (err: any) {
            console.error('Failed to load entries:', err);
            console.error('Error code:', err?.code);
            console.error('Error message:', err?.message);
            toast.error('Failed to load entries');
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        loadEntries();
    }, [loadEntries]);

    useEffect(() => {
        setFilters((f) => ({ ...f, favoritesOnly: viewParam === 'favorites' }));
    }, [viewParam]);

    const filteredEntries = searchEntries(entries, filters);

    const handleToggleFavorite = async (id: string, val: boolean) => {
        try {
            await updateEntry(id, { favorited: val });
            setEntries((prev) =>
                prev.map((e) => (e.id === id ? { ...e, favorited: val } : e))
            );
            toast.success(val ? 'Added to favorites' : 'Removed from favorites');
        } catch {
            toast.error('Failed to update');
        }
    };

    const handleTogglePin = async (id: string, val: boolean) => {
        try {
            await updateEntry(id, { pinned: val });
            setEntries((prev) =>
                prev.map((e) => (e.id === id ? { ...e, pinned: val } : e))
            );
            toast.success(val ? 'Pinned' : 'Unpinned');
        } catch {
            toast.error('Failed to update');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this entry? This cannot be undone.')) return;
        try {
            await deleteEntry(id);
            setEntries((prev) => prev.filter((e) => e.id !== id));
            toast.success('Entry deleted');
        } catch {
            toast.error('Failed to delete');
        }
    };

    // Extract all unique tags
    const allTags = Array.from(new Set(entries.flatMap((e) => e.tags))).sort();

    return (
        <div className="max-w-5xl mx-auto px-4 py-6 lg:py-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-display font-bold">
                        {viewParam === 'favorites' ? '❤️ Favorites' : viewParam === 'tags' ? '🏷️ Tags' : '📖 Your Diary'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                    </p>
                </div>
                <button
                    onClick={() => router.push('/entry/new')}
                    className="hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-500 to-purple-600 text-white font-medium shadow-lg shadow-brand-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                    <PenSquare className="w-4 h-4" />
                    New Entry
                </button>
            </div>

            {/* Search & Filters */}
            <div className="mb-6 space-y-3 animate-slide-up">
                <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search entries, tags..."
                            value={filters.query}
                            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 transition-all text-sm"
                        />
                        {filters.query && (
                            <button
                                onClick={() => setFilters({ ...filters, query: '' })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                            showFilters
                                ? 'bg-brand-500/10 text-brand-500'
                                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                        )}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                    </button>
                    <div className="flex bg-secondary rounded-xl p-0.5">
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                'w-9 h-9 rounded-lg flex items-center justify-center transition-all',
                                viewMode === 'list'
                                    ? 'bg-background shadow-sm text-foreground'
                                    : 'text-muted-foreground'
                            )}
                        >
                            <LayoutList className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('gallery')}
                            className={cn(
                                'w-9 h-9 rounded-lg flex items-center justify-center transition-all',
                                viewMode === 'gallery'
                                    ? 'bg-background shadow-sm text-foreground'
                                    : 'text-muted-foreground'
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Expanded filters */}
                {showFilters && (
                    <div className="glass-card p-4 flex flex-wrap gap-3 animate-slide-down">
                        <button
                            onClick={() => setFilters({ ...filters, mediaOnly: !filters.mediaOnly })}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                                filters.mediaOnly
                                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                            )}
                        >
                            <ImageIcon className="w-3.5 h-3.5" />
                            With images
                        </button>
                        <button
                            onClick={() => setFilters({ ...filters, favoritesOnly: !filters.favoritesOnly })}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                                filters.favoritesOnly
                                    ? 'bg-red-500/10 text-red-500'
                                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                            )}
                        >
                            <Heart className="w-3.5 h-3.5" />
                            Favorites
                        </button>
                        {allTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => {
                                    const tags = filters.tags.includes(tag)
                                        ? filters.tags.filter((t) => t !== tag)
                                        : [...filters.tags, tag];
                                    setFilters({ ...filters, tags });
                                }}
                                className={cn(
                                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                                    filters.tags.includes(tag)
                                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                                )}
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Entry Feed */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="glass-card p-6 animate-pulse">
                            <div className="h-5 w-48 bg-secondary rounded mb-3" />
                            <div className="h-3 w-full bg-secondary rounded mb-2" />
                            <div className="h-3 w-3/4 bg-secondary rounded" />
                        </div>
                    ))}
                </div>
            ) : filteredEntries.length === 0 ? (
                <div className="text-center py-20 animate-fade-in">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-10 h-10 text-brand-500" />
                    </div>
                    <h2 className="text-xl font-display font-semibold mb-2">
                        {filters.query || filters.tags.length > 0
                            ? 'No entries found'
                            : 'Start your journal'}
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                        {filters.query || filters.tags.length > 0
                            ? 'Try adjusting your search or filters.'
                            : 'Write your first diary entry and capture your thoughts, memories, and moments.'}
                    </p>
                    {!filters.query && filters.tags.length === 0 && (
                        <button
                            onClick={() => router.push('/entry/new')}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-purple-600 text-white font-medium shadow-lg shadow-brand-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <PenSquare className="w-4 h-4" />
                            Write your first entry
                        </button>
                    )}
                </div>
            ) : (
                <div
                    className={cn(
                        viewMode === 'gallery'
                            ? 'columns-1 sm:columns-2 lg:columns-3 gap-4'
                            : 'space-y-0'
                    )}
                >
                    {filteredEntries.map((entry) => (
                        <EntryCard
                            key={entry.id}
                            entry={entry}
                            view={viewMode}
                            onToggleFavorite={handleToggleFavorite}
                            onTogglePin={handleTogglePin}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
