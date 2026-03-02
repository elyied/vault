export interface DiaryEntry {
    id: string;
    userId: string;
    title: string;
    content: Record<string, unknown>; // Tiptap JSON
    plainText: string;
    tags: string[];
    images: string[];
    pinned: boolean;
    favorited: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface Tag {
    id: string;
    name: string;
    color: string;
    userId: string;
    count: number;
}

export interface UserProfile {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
}

export type ViewMode = 'list' | 'gallery';

export type SortMode = 'newest' | 'oldest' | 'updated';

export interface SearchFilters {
    query: string;
    tags: string[];
    dateFrom?: number;
    dateTo?: number;
    mediaOnly: boolean;
    favoritesOnly: boolean;
}
