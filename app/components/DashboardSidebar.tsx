import { LayoutGrid, HardDrive, Settings, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DashboardSidebarProps {
    activeTab: 'storage' | 'deployments' | 'settings';
    setActiveTab: (tab: 'storage' | 'deployments' | 'settings') => void;
    onSignOut: () => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function DashboardSidebar({ activeTab, setActiveTab, onSignOut, isOpen, onClose }: DashboardSidebarProps) {
    const menuItems = [
        { id: 'storage', label: 'Storage', icon: HardDrive },
        { id: 'deployments', label: 'Deployments', icon: LayoutGrid },
        { id: 'settings', label: 'Settings', icon: Settings },
    ] as const;

    const handleTabClick = (tab: 'storage' | 'deployments' | 'settings') => {
        setActiveTab(tab);
        onClose(); // Close sidebar on mobile after selecting a tab
    };

    return (
        <>
            {/* Backdrop (Mobile Only) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                initial={false}
                animate={{ x: isOpen ? 0 : '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col relative overflow-hidden md:relative md:translate-x-0"
            >
                {/* Ambient Background */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

                {/* Close Button (Mobile Only) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 relative z-10">
                    <h2 className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Rose
                    </h2>
                </div>

                <nav className="flex-1 px-4 space-y-2 relative z-10">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleTabClick(item.id)}
                                className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive ? 'text-white' : 'text-muted-foreground hover:text-white'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active-tab"
                                        className="absolute inset-0 bg-white/10 rounded-lg border border-white/5"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-3">
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10 relative z-10">
                    <button
                        onClick={onSignOut}
                        className="group w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Sign Out
                    </button>
                </div>
            </motion.div>
        </>
    );
}
