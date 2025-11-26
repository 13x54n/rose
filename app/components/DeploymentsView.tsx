import { Plus, Github, ExternalLink, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DeploymentsView() {
    const deployments = [
        {
            name: 'rose-landing-page',
            url: 'rose-landing.vercel.app',
            branch: 'main',
            status: 'Ready',
            time: '2m ago',
            framework: 'Next.js'
        },
        {
            name: 'defi-dashboard',
            url: 'defi-dash.rose.app',
            branch: 'dev',
            status: 'Building',
            time: 'Just now',
            framework: 'React'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 md:p-8 max-w-6xl mx-auto"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2 tracking-tight">Deployments</h1>
                    <p className="text-muted-foreground">Manage your web applications.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
                >
                    <Plus className="w-4 h-4" />
                    New Project
                </motion.button>
            </div>

            <div className="grid gap-4">
                {deployments.map((deploy, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group p-6 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/10 transition-all duration-200"
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold tracking-tight">{deploy.name}</h3>
                                    <a href={`https://${deploy.url}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-white transition-colors p-1 hover:bg-white/10 rounded">
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                                <p className="text-sm text-muted-foreground font-mono">{deploy.url}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${deploy.status === 'Ready'
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${deploy.status === 'Ready' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                                        }`} />
                                    {deploy.status}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors">
                                <Github className="w-4 h-4" />
                                <span className="font-mono">{deploy.branch}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-white/20" />
                                <span>{deploy.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-black border border-white/10 flex items-center justify-center text-[10px] font-bold">
                                    {deploy.framework[0]}
                                </div>
                                <span>{deploy.framework}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
