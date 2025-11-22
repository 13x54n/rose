import { HardDrive, Globe, Shield, Zap, Lock, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
    {
        title: "Unlimited Storage",
        description: "Store petabytes of data without worrying about caps. Our decentralized network scales infinitely with your needs.",
        icon: HardDrive,
        className: "md:col-span-2",
    },
    {
        title: "Global Distribution",
        description: "Content is replicated across thousands of nodes worldwide, ensuring 100% availability and censorship resistance.",
        icon: Globe,
        className: "md:col-span-1",
    },
    {
        title: "End-to-End Encryption",
        description: "Your data is encrypted client-side. Only you hold the keys. Not even we can see your files.",
        icon: Lock,
        className: "md:col-span-1",
    },
    {
        title: "Lightning Fast",
        description: "Retrieve data from the nearest node with low latency. Optimized for high-performance applications.",
        icon: Zap,
        className: "md:col-span-2",
    },
];

export default function Features() {
    return (
        <section id="features" className="py-24 bg-background relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                        Built for the <span className="text-muted-foreground">Future</span>.
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        Experience the power of Web3 storage with features designed for security, scalability, and absolute control.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={cn(
                                "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 hover:bg-white/10 transition-colors",
                                feature.className
                            )}
                        >
                            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white group-hover:bg-white group-hover:text-black transition-colors">
                                <feature.icon className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>

                            {/* Hover Effect */}
                            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
