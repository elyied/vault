import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
} from 'firebase/firestore';
import { db } from './firebase';
import { DiaryEntry, Tag } from '@/types';
import { generateId, extractPlainText } from './utils';

const ENTRIES_COL = 'entries';
const TAGS_COL = 'tags';

// ── Entries ──

export async function createEntry(
    userId: string,
    data: Partial<DiaryEntry>
): Promise<DiaryEntry> {
    const id = generateId();
    const now = Date.now();
    const entry: DiaryEntry = {
        id,
        userId,
        title: data.title || 'Untitled',
        content: data.content || {},
        plainText: data.content ? extractPlainText(data.content) : '',
        tags: data.tags || [],
        images: data.images || [],
        pinned: data.pinned || false,
        favorited: data.favorited || false,
        createdAt: now,
        updatedAt: now,
    };
    await setDoc(doc(db, ENTRIES_COL, id), entry);
    return entry;
}

export async function updateEntry(
    id: string,
    data: Partial<DiaryEntry>
): Promise<void> {
    const updates: Record<string, unknown> = { ...data, updatedAt: Date.now() };
    if (data.content) {
        updates.plainText = extractPlainText(data.content);
    }
    await updateDoc(doc(db, ENTRIES_COL, id), updates as Record<string, any>);
}

export async function deleteEntry(id: string): Promise<void> {
    await deleteDoc(doc(db, ENTRIES_COL, id));
}

export async function getEntry(id: string): Promise<DiaryEntry | null> {
    const snap = await getDoc(doc(db, ENTRIES_COL, id));
    if (!snap.exists()) return null;
    return snap.data() as DiaryEntry;
}

export async function getEntries(
    userId: string,
    pageSize = 100,
): Promise<{ entries: DiaryEntry[]; lastDoc: null }> {
    // Simple query: only filter by userId, no orderBy (avoids composite index)
    const q = query(
        collection(db, ENTRIES_COL),
        where('userId', '==', userId),
    );

    const snap = await getDocs(q);
    const entries = snap.docs.map((d) => d.data() as DiaryEntry);

    // Sort client-side: pinned first, then by updatedAt descending
    entries.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (b.updatedAt || 0) - (a.updatedAt || 0);
    });

    return { entries, lastDoc: null };
}

export async function getAllEntries(userId: string): Promise<DiaryEntry[]> {
    const q = query(
        collection(db, ENTRIES_COL),
        where('userId', '==', userId),
    );
    const snap = await getDocs(q);
    const entries = snap.docs.map((d) => d.data() as DiaryEntry);
    entries.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    return entries;
}

// ── Tags ──

export async function createTag(
    userId: string,
    name: string,
    color: string = '#8b5cf6'
): Promise<Tag> {
    const id = generateId();
    const tag: Tag = { id, name, color, userId, count: 0 };
    await setDoc(doc(db, TAGS_COL, id), tag);
    return tag;
}

export async function getTags(userId: string): Promise<Tag[]> {
    const q = query(
        collection(db, TAGS_COL),
        where('userId', '==', userId),
    );
    const snap = await getDocs(q);
    const tags = snap.docs.map((d) => d.data() as Tag);
    tags.sort((a, b) => a.name.localeCompare(b.name));
    return tags;
}

export async function updateTag(
    id: string,
    data: Partial<Tag>
): Promise<void> {
    await updateDoc(doc(db, TAGS_COL, id), data);
}

export async function deleteTag(id: string): Promise<void> {
    await deleteDoc(doc(db, TAGS_COL, id));
}

// ── Delete All User Data ──

export async function deleteAllUserData(userId: string): Promise<number> {
    // Delete all entries
    const entriesQ = query(
        collection(db, ENTRIES_COL),
        where('userId', '==', userId)
    );
    const entriesSnap = await getDocs(entriesQ);
    let count = 0;
    for (const d of entriesSnap.docs) {
        await deleteDoc(d.ref);
        count++;
    }

    // Delete all tags
    const tagsQ = query(
        collection(db, TAGS_COL),
        where('userId', '==', userId)
    );
    const tagsSnap = await getDocs(tagsQ);
    for (const d of tagsSnap.docs) {
        await deleteDoc(d.ref);
    }

    return count;
}
