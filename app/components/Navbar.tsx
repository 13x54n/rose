'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, signOut } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-black rounded-full"></div>
                        </div>
                        <Link href="/" className="text-xl font-bold tracking-tight">
                            Rose
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="flex items-center space-x-8">
                            <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                Features
                            </Link>
                            <Link href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                How it Works
                            </Link>
                            <Link href="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                Pricing
                            </Link>
                        </div>
                    </div>
                    <div>
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/dashboard"
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={signOut}
                                    className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
