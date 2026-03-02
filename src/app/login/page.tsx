'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookOpen, Sparkles, Lock, Palette } from 'lucide-react';

export default function LoginPage() {
    const { user, loading, signInWithGoogle } = useAuth();
    const router = useRouter();
    const [isSigningIn, setIsSigningIn] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            router.replace('/dashboard');
        }
    }, [user, loading, router]);

    const handleSignIn = async () => {
        setIsSigningIn(true);
        try {
            await signInWithGoogle();
        } catch (err) {
            console.error('Sign-in error:', err);
            setIsSigningIn(false);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-brand-950/20 dark:to-purple-950/20" />
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-lg w-full">
                {/* Logo */}
                <div className="flex flex-col items-center gap-4 animate-fade-in">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-brand-500/30 transform hover:scale-105 transition-transform duration-300">
                        <BookOpen className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
                            Vault Diary
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Your private digital journal
                        </p>
                    </div>
                </div>

                {/* Features preview */}
                <div className="grid grid-cols-3 gap-3 w-full animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    {[
                        { icon: Sparkles, label: 'Rich Editor', desc: 'Images & text' },
                        { icon: Lock, label: 'Private', desc: 'Your eyes only' },
                        { icon: Palette, label: 'Beautiful', desc: 'Premium design' },
                    ].map(({ icon: Icon, label, desc }) => (
                        <div key={label} className="glass-card p-4 text-center hover-lift">
                            <Icon className="w-6 h-6 text-brand-500 mx-auto mb-2" />
                            <p className="font-medium text-sm">{label}</p>
                            <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                    ))}
                </div>

                {/* Sign in button */}
                <button
                    onClick={handleSignIn}
                    disabled={isSigningIn}
                    className="w-full max-w-sm flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group animate-slide-up"
                    style={{ animationDelay: '0.4s' }}
                >
                    {/* Google Logo SVG */}
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {isSigningIn ? 'Signing in…' : 'Continue with Google'}
                    </span>
                </button>

                {/* Footer */}
                <p className="text-xs text-muted-foreground text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
                    Free & open source · Your data stays private
                </p>
            </div>
        </div>
    );
}
