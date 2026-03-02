'use client';

import { useAuth } from '@/lib/auth';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { DiaryEditor } from '@/components/editor/diary-editor';
import { createEntry, getEntry, updateEntry, deleteEntry } from '@/lib/db';
import { DiaryEntry } from '@/types';
import { extractPlainText } from '@/lib/utils';
import {
    ArrowLeft,
    Save,
    Trash2,
    Pin,
    Heart,
    X,
    Plus,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function EntryPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const entryId = params.id as string;
    const isNew = entryId === 'new';

    const [title, setTitle] = useState('');
    const [content, setContent] = useState<Record<string, unknown>>({});
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [pinned, setPinned] = useState(false);
    const [favorited, setFavorited] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(!isNew);
    const [savedId, setSavedId] = useState<string | null>(isNew ? null : entryId);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const contentRef = useRef(content);
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    contentRef.current = content;

    // Load existing entry
    useEffect(() => {
        if (!isNew && entryId) {
            loadEntry();
        }
        return () => {
            // Cleanup autosave timer on unmount
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entryId, isNew]);

    const loadEntry = async () => {
        try {
            const entry = await getEntry(entryId);
            if (entry) {
                setTitle(entry.title);
                setContent(entry.content);
                setTags(entry.tags);
                setPinned(entry.pinned);
                setFavorited(entry.favorited);
                setImages(entry.images);
            } else {
                toast.error('Entry not found');
                router.replace('/dashboard');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load entry');
        }
        setLoading(false);
    };

    // Extract images from content
    const extractImages = useCallback((json: Record<string, unknown>): string[] => {
        const imgs: string[] = [];
        function walk(node: Record<string, unknown>) {
            if (node.type === 'image' && typeof (node.attrs as Record<string, unknown>)?.src === 'string') {
                imgs.push((node.attrs as Record<string, unknown>).src as string);
            }
            if (Array.isArray(node.content)) {
                node.content.forEach((child: Record<string, unknown>) => walk(child));
            }
        }
        walk(json);
        return imgs;
    }, []);

    // Content change handler with debounced autosave
    const handleContentChange = useCallback((json: Record<string, unknown>) => {
        setContent(json);
        setImages(extractImages(json));

        // Debounced autosave (save after 5s of inactivity)
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(() => {
            // Trigger save only if entry already exists
            if (savedId && !isNew) {
                handleAutoSave(json);
            }
        }, 5000);
    }, [extractImages, savedId, isNew]);

    const handleAutoSave = async (json: Record<string, unknown>) => {
        if (!user || !savedId) return;
        try {
            const plainText = extractPlainText(json);
            const entryImages = extractImages(json);
            await updateEntry(savedId, {
                title: title || 'Untitled',
                content: json,
                plainText,
                tags,
                images: entryImages,
                pinned,
                favorited,
            });
            setLastSaved(new Date());
        } catch (err) {
            console.error('Auto-save failed:', err);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);

        try {
            const plainText = extractPlainText(contentRef.current);
            const entryImages = extractImages(contentRef.current);

            if (savedId && !isNew) {
                await updateEntry(savedId, {
                    title: title || 'Untitled',
                    content: contentRef.current,
                    plainText,
                    tags,
                    images: entryImages,
                    pinned,
                    favorited,
                });
                toast.success('Entry saved');
            } else {
                const newEntry = await createEntry(user.uid, {
                    title: title || 'Untitled',
                    content: contentRef.current,
                    tags,
                    images: entryImages,
                    pinned,
                    favorited,
                });
                setSavedId(newEntry.id);
                // Update URL without full reload
                window.history.replaceState(null, '', `/entry/${newEntry.id}`);
                toast.success('Entry created');
            }
            setLastSaved(new Date());
            localStorage.removeItem(`vault_draft_${savedId || 'new'}`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to save entry');
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!savedId || isNew) {
            router.push('/dashboard');
            return;
        }
        if (!confirm('Delete this entry? This cannot be undone.')) return;

        try {
            await deleteEntry(savedId);
            localStorage.removeItem(`vault_draft_${savedId}`);
            toast.success('Entry deleted');
            router.push('/dashboard');
        } catch {
            toast.error('Failed to delete');
        }
    };

    const handleAddTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag]);
        }
        setTagInput('');
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 lg:py-10 animate-fade-in">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back</span>
                </button>

                <div className="flex items-center gap-2">
                    {lastSaved && (
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                            Saved {lastSaved.toLocaleTimeString()}
                        </span>
                    )}
                    <button
                        onClick={() => setPinned(!pinned)}
                        className={cn(
                            'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                            pinned
                                ? 'bg-brand-500/10 text-brand-500'
                                : 'bg-secondary text-muted-foreground hover:text-foreground'
                        )}
                        title={pinned ? 'Unpin' : 'Pin'}
                    >
                        <Pin className={cn('w-4 h-4', pinned && 'fill-current')} />
                    </button>
                    <button
                        onClick={() => setFavorited(!favorited)}
                        className={cn(
                            'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                            favorited
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-secondary text-muted-foreground hover:text-foreground'
                        )}
                        title={favorited ? 'Unfavorite' : 'Favorite'}
                    >
                        <Heart className={cn('w-4 h-4', favorited && 'fill-current')} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-purple-600 text-white font-medium shadow-lg shadow-brand-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">Save</span>
                    </button>
                </div>
            </div>

            {/* Title input */}
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled"
                className="w-full text-3xl md:text-4xl font-display font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/40 mb-4"
            />

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="flex items-center gap-1 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-sm font-medium group"
                    >
                        #{tag}
                        <button
                            onClick={() => handleRemoveTag(tag)}
                            className="w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-brand-500/20 transition-all"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <div className="flex items-center gap-1">
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag();
                            }
                        }}
                        placeholder="Add tag…"
                        className="w-24 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
                    />
                    {tagInput && (
                        <button
                            onClick={handleAddTag}
                            className="w-6 h-6 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 hover:bg-brand-500/20 transition-all"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Editor */}
            <DiaryEditor
                content={content}
                onChange={handleContentChange}
                placeholder="Start writing your thoughts, memories, and ideas..."
            />
        </div>
    );
}
