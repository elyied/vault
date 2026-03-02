import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
    title: 'Vault Diary — Your Private Digital Journal',
    description: 'A premium personal diary app with rich text editing, image uploads, tags, and search. Secure, private, and beautiful.',
    keywords: ['diary', 'journal', 'notes', 'personal', 'private'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen font-sans">
                <ThemeProvider>
                    <AuthProvider>
                        {children}
                        <Toaster
                            position="bottom-right"
                            toastOptions={{
                                className: 'glass-card',
                            }}
                        />
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
