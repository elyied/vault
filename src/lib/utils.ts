import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | number): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
        }
        return `${diffHours}h ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
}

export function extractPlainText(json: Record<string, unknown>): string {
    let text = '';
    function walk(node: Record<string, unknown>) {
        if (node.text && typeof node.text === 'string') {
            text += node.text + ' ';
        }
        if (Array.isArray(node.content)) {
            node.content.forEach((child: Record<string, unknown>) => walk(child));
        }
    }
    walk(json);
    return text.trim();
}

export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function truncate(str: string, len: number): string {
    if (str.length <= len) return str;
    return str.slice(0, len).trim() + '…';
}
