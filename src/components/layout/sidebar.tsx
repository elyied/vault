'use client';

import { useAuth } from '@/lib/auth';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import {
    BookOpen,
    PenSquare,
    Settings,
    LogOut,
    Moon,
    Sun,
    Menu,
    X,
    Heart,
    Tag,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/dashboard', icon: BookOpen, label: 'Diary', view: null },
    { href: '/dashboard?view=favorites', icon: Heart, label: 'Favorites', view: 'favorites' },
    { href: '/dashboard?view=tags', icon: Tag, label: 'Tags', view: 'tags' },
    { href: '/settings', icon: Settings, label: 'Settings', view: null },
];

export function Sidebar() {
    const { user, signOut } = useAuth();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => setMounted(true), []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname, searchParams]);

    const handleNav = (href: string) => {
        router.push(href);
        setMobileOpen(false);
    };

    const isNavActive = (item: typeof navItems[0]) => {
        if (item.href === '/settings') return pathname === '/settings';
        if (item.view) return pathname === '/dashboard' && searchParams.get('view') === item.view;
        return pathname === '/dashboard' && !searchParams.get('view');
    };

    return (
        <>
            {/* Mobile header */}
            <header className="lg:hidden fixed top-0 inset-x-0 z-50 glass border-b border-border/50 px-4 h-14 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-display font-bold text-lg gradient-text">Vault</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push('/entry/new')}
                        className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors"
                    >
                        <PenSquare className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                    >
                        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </button>
                </div>
            </header>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 left-0 z-50 h-full w-72 glass border-r border-border/50 flex flex-col transition-transform duration-300 lg:translate-x-0',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo */}
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-xl gradient-text">Vault Diary</h1>
                        <p className="text-xs text-muted-foreground">Private journal</p>
                    </div>
                </div>

                {/* New entry button */}
                <div className="px-4 mb-4">
                    <button
                        onClick={() => handleNav('/entry/new')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-purple-600 text-white font-medium shadow-lg shadow-brand-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    >
                        <PenSquare className="w-5 h-5" />
                        New Entry
                    </button>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-3 space-y-1">
                    {navItems.map((item) => {
                        const active = isNavActive(item);
                        return (
                            <button
                                key={item.href}
                                onClick={() => handleNav(item.href)}
                                className={cn(
                                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                                    active
                                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div className="p-4 border-t border-border/50 space-y-3">
                    {/* Theme toggle */}
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-150"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                        </button>
                    )}

                    {/* User profile */}
                    {user && (
                        <div className="flex items-center gap-3 px-4 py-2">
                            {user.photoURL ? (
                                <Image
                                    src={user.photoURL}
                                    alt={user.displayName || 'User'}
                                    width={36}
                                    height={36}
                                    className="rounded-full ring-2 ring-brand-500/20"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-600 font-medium">
                                    {user.displayName?.[0] || user.email?.[0] || '?'}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.displayName}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                        </div>
                    )}

                    {/* Sign out */}
                    <button
                        onClick={signOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-all duration-150"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign out
                    </button>
                </div>
            </aside>
        </>
    );
}
