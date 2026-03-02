import { DiaryEntry, SearchFilters } from '@/types';

export function searchEntries(
    entries: DiaryEntry[],
    filters: SearchFilters
): DiaryEntry[] {
    let results = [...entries];

    // Full-text search
    if (filters.query) {
        const q = filters.query.toLowerCase();
        results = results.filter(
            (e) =>
                e.title.toLowerCase().includes(q) ||
                e.plainText.toLowerCase().includes(q) ||
                e.tags.some((t) => t.toLowerCase().includes(q))
        );
    }

    // Tag filter
    if (filters.tags.length > 0) {
        results = results.filter((e) =>
            filters.tags.some((ft) => e.tags.includes(ft))
        );
    }

    // Date range
    if (filters.dateFrom) {
        results = results.filter((e) => e.createdAt >= filters.dateFrom!);
    }
    if (filters.dateTo) {
        results = results.filter((e) => e.createdAt <= filters.dateTo!);
    }

    // Media only
    if (filters.mediaOnly) {
        results = results.filter((e) => e.images.length > 0);
    }

    // Favorites only
    if (filters.favoritesOnly) {
        results = results.filter((e) => e.favorited);
    }

    return results;
}
