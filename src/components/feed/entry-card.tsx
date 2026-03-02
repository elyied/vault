'use client';

import { DiaryEntry } from '@/types';
import { formatDate, truncate, cn } from '@/lib/utils';
import { Heart, Pin, Image as ImageIcon, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

interface EntryCardProps {
    entry: DiaryEntry;
    view: 'list' | 'gallery';
    onToggleFavorite?: (id: string, val: boolean) => void;
    onTogglePin?: (id: string, val: boolean) => void;
    onDelete?: (id: string) => void;
}

export function EntryCard({ entry, view, onToggleFavorite, onTogglePin, onDelete }: EntryCardProps) {
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const firstImage = entry.images?.[0];

    // Close menu on outside click
    useEffect(() => {
        if (!showMenu) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);

    const handleClick = () => {
        router.push(`/entry/${entry.id}`);
    };

    return (
        <div
            className={cn(
                'glass-card group cursor-pointer hover-lift overflow-hidden relative animate-fade-in',
                view === 'gallery' ? 'break-inside-avoid mb-4' : 'mb-3'
            )}
            onClick={handleClick}
        >
            {/* Image preview for gallery */}
            {firstImage && view === 'gallery' && (
                <div className="relative w-full aspect-video overflow-hidden">
                    <img
                        src={firstImage}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
            )}

            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {entry.pinned && (
                                <Pin className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 fill-current" />
                            )}
                            <h3 className="font-semibold text-base truncate">
                                {entry.title || 'Untitled'}
                            </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {formatDate(entry.updatedAt)}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite?.(entry.id, !entry.favorited);
                            }}
                            className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                                entry.favorited
                                    ? 'text-red-500 bg-red-500/10'
                                    : 'text-muted-foreground hover:bg-secondary'
                            )}
                        >
                            <Heart className={cn('w-4 h-4', entry.favorited && 'fill-current')} />
                        </button>
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-all"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {showMenu && (
                                <div
                                    className="absolute right-0 top-full mt-1 w-40 glass-card py-1 z-20 shadow-xl animate-scale-in"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() => {
                                            onTogglePin?.(entry.id, !entry.pinned);
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-3 py-2 text-sm text-left hover:bg-secondary transition-colors flex items-center gap-2"
                                    >
                                        <Pin className="w-4 h-4" />
                                        {entry.pinned ? 'Unpin' : 'Pin to top'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            router.push(`/entry/${entry.id}`);
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-3 py-2 text-sm text-left hover:bg-secondary transition-colors flex items-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            onDelete?.(entry.id);
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-3 py-2 text-sm text-left text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preview text */}
                {entry.plainText && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {truncate(entry.plainText, view === 'gallery' ? 100 : 180)}
                    </p>
                )}

                {/* Image indicator for list view */}
                {firstImage && view === 'list' && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>{entry.images.length} image{entry.images.length > 1 ? 's' : ''}</span>
                    </div>
                )}

                {/* Tags */}
                {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {entry.tags.slice(0, 4).map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-medium"
                            >
                                {tag}
                            </span>
                        ))}
                        {entry.tags.length > 4 && (
                            <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-xs">
                                +{entry.tags.length - 4}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
