'use client';

import { useAuth } from '@/lib/auth';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { getAllEntries, deleteAllUserData } from '@/lib/db';
import { deleteUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
    User,
    Moon,
    Sun,
    Monitor,
    Download,
    Upload,
    Trash2,
    Shield,
    Loader2,
    Check,
    FileJson,
    AlertTriangle,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { createEntry } from '@/lib/db';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);
    const [deletingData, setDeletingData] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState('');
    const [showDeleteAccount, setShowDeleteAccount] = useState(false);

    useEffect(() => setMounted(true), []);

    const handleExport = async () => {
        if (!user) return;
        setExporting(true);

        try {
            const entries = await getAllEntries(user.uid);

            const exportData = {
                version: 1,
                exportedAt: new Date().toISOString(),
                entryCount: entries.length,
                entries,
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vault-export-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`Exported ${entries.length} entries`);
        } catch (err) {
            console.error(err);
            toast.error('Export failed');
        }
        setExporting(false);
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!user) return;
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.entries || !Array.isArray(data.entries)) {
                throw new Error('Invalid export file format');
            }

            let imported = 0;
            for (const entry of data.entries) {
                await createEntry(user.uid, {
                    title: entry.title,
                    content: entry.content,
                    tags: entry.tags || [],
                    images: entry.images || [],
                    pinned: entry.pinned || false,
                    favorited: entry.favorited || false,
                });
                imported++;
            }

            toast.success(`Imported ${imported} entries`);
        } catch (err) {
            console.error(err);
            toast.error('Import failed. Check file format.');
        }
        setImporting(false);
        e.target.value = '';
    };

    const handleDeleteAllData = async () => {
        if (!user) return;
        if (confirmDelete !== 'DELETE') {
            toast.error('Type DELETE to confirm');
            return;
        }

        setDeletingData(true);
        try {
            const count = await deleteAllUserData(user.uid);
            toast.success(`Deleted ${count} entries and all tags`);
            setConfirmDelete('');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete data');
        }
        setDeletingData(false);
    };

    const handleDeleteAccount = async () => {
        if (!user) return;
        if (confirmDelete !== 'DELETE') {
            toast.error('Type DELETE to confirm');
            return;
        }

        setDeletingAccount(true);
        try {
            // First delete all data
            await deleteAllUserData(user.uid);
            // Then delete the auth account
            const currentUser = auth.currentUser;
            if (currentUser) {
                await deleteUser(currentUser);
            }
            toast.success('Account deleted. Goodbye!');
            router.push('/login');
        } catch (err: any) {
            console.error(err);
            if (err?.code === 'auth/requires-recent-login') {
                toast.error('Please sign out and sign back in, then try again. (Security requirement)');
            } else {
                toast.error('Failed to delete account');
            }
        }
        setDeletingAccount(false);
    };

    const themes = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    if (!mounted) return null;

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 lg:py-10 space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-display font-bold">⚙️ Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your account, appearance, and data
                </p>
            </div>

            {/* Profile */}
            <section className="glass-card p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-brand-500" />
                    Profile
                </h2>
                {user && (
                    <div className="flex items-center gap-4">
                        {user.photoURL ? (
                            <Image
                                src={user.photoURL}
                                alt={user.displayName || 'User'}
                                width={64}
                                height={64}
                                className="rounded-2xl ring-4 ring-brand-500/10"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl bg-brand-500/20 flex items-center justify-center text-brand-600 text-2xl font-bold">
                                {user.displayName?.[0] || '?'}
                            </div>
                        )}
                        <div>
                            <p className="font-semibold text-lg">{user.displayName || 'Anonymous'}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                )}
            </section>

            {/* Appearance */}
            <section className="glass-card p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Sun className="w-5 h-5 text-brand-500" />
                    Appearance
                </h2>
                <div className="flex gap-3">
                    {themes.map(({ value, icon: Icon, label }) => (
                        <button
                            key={value}
                            onClick={() => setTheme(value)}
                            className={cn(
                                'flex-1 flex flex-col items-center gap-2 p-4 rounded-xl transition-all',
                                theme === value
                                    ? 'bg-brand-500/10 border-2 border-brand-500/30 text-brand-600 dark:text-brand-400'
                                    : 'bg-secondary border-2 border-transparent hover:bg-secondary/80'
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm font-medium">{label}</span>
                            {theme === value && <Check className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            </section>

            {/* Data Management */}
            <section className="glass-card p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <FileJson className="w-5 h-5 text-brand-500" />
                    Your Data
                </h2>
                <div className="space-y-3">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-all text-left"
                    >
                        {exporting ? (
                            <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                        ) : (
                            <Download className="w-5 h-5 text-brand-500" />
                        )}
                        <div>
                            <p className="font-medium text-sm">Export All Data</p>
                            <p className="text-xs text-muted-foreground">
                                Download all your entries as a JSON file
                            </p>
                        </div>
                    </button>

                    <label className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-all cursor-pointer">
                        {importing ? (
                            <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                        ) : (
                            <Upload className="w-5 h-5 text-brand-500" />
                        )}
                        <div>
                            <p className="font-medium text-sm">Import Data</p>
                            <p className="text-xs text-muted-foreground">
                                Restore entries from a previously exported file
                            </p>
                        </div>
                        <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={handleImport}
                            disabled={importing}
                        />
                    </label>
                </div>
            </section>

            {/* Privacy */}
            <section className="glass-card p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-brand-500" />
                    Privacy
                </h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Your diary entries are stored securely in the cloud, linked to your Google account. <strong className="text-foreground">Only you can see them.</strong></p>
                    <p>You can export all your data anytime or permanently delete everything using the options below.</p>
                </div>
            </section>

            {/* Danger Zone */}
            <section className="glass-card p-6 border-red-500/30">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-red-500">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                </h2>

                <div className="space-y-4">
                    {/* Delete All Data */}
                    <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="font-medium text-sm">Delete All Entries</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Permanently delete all your diary entries and tags. This cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                            <input
                                type="text"
                                placeholder='Type "DELETE" to confirm'
                                value={confirmDelete}
                                onChange={(e) => setConfirmDelete(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-red-500/30"
                            />
                            <button
                                onClick={handleDeleteAllData}
                                disabled={deletingData || confirmDelete !== 'DELETE'}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                {deletingData ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Delete Data
                            </button>
                        </div>
                    </div>

                    {/* Delete Account */}
                    <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                        <div>
                            <p className="font-medium text-sm">Delete Account</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Permanently delete your account and all associated data. You will be signed out immediately.
                            </p>
                        </div>
                        {!showDeleteAccount ? (
                            <button
                                onClick={() => setShowDeleteAccount(true)}
                                className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-500 text-sm font-medium hover:bg-red-500/10 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                                I want to delete my account
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 mt-3">
                                <input
                                    type="text"
                                    placeholder='Type "DELETE" to confirm'
                                    value={confirmDelete}
                                    onChange={(e) => setConfirmDelete(e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-red-500/30"
                                />
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deletingAccount || confirmDelete !== 'DELETE'}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    Delete Account
                                </button>
                                <button
                                    onClick={() => setShowDeleteAccount(false)}
                                    className="px-3 py-2 rounded-lg bg-secondary text-sm hover:bg-secondary/80 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sign Out */}
                    <button
                        onClick={signOut}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all font-medium text-sm"
                    >
                        Sign out
                    </button>
                </div>
            </section>
        </div>
    );
}
