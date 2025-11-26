'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardSidebar from '../components/DashboardSidebar';
import StorageView from '../components/StorageView';
import DeploymentsView from '../components/DeploymentsView';
import { Menu } from 'lucide-react';

export default function DashboardPage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'storage' | 'deployments' | 'settings'>('storage');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
            <DashboardSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onSignOut={signOut}
                isOpen={true}
                onClose={() => setIsSidebarOpen(true)}
            />

            <main className="flex-1 overflow-y-auto">
                {activeTab === 'storage' && <StorageView />}
                {activeTab === 'deployments' && <DeploymentsView />}
                {activeTab === 'settings' && (
                    <div className="p-4 md:p-8 max-w-4xl mx-auto">
                        <h1 className="text-3xl font-bold mb-8">Settings</h1>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4">Account Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                                    <div className="p-3 bg-black/20 rounded-lg border border-white/5 text-sm">
                                        {user.email}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">User ID</label>
                                    <div className="p-3 bg-black/20 rounded-lg border border-white/5 text-sm font-mono text-muted-foreground">
                                        {user.uid}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
