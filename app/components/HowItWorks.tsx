import { Upload, Lock, Globe, Key } from 'lucide-react';

const steps = [
    {
        number: "01",
        title: "Upload Data",
        description: "Drag and drop your files. We support any file type and size.",
        icon: Upload,
    },
    {
        number: "02",
        title: "Auto-Encryption",
        description: "Data is encrypted client-side before leaving your device.",
        icon: Lock,
    },
    {
        number: "03",
        title: "Global Distribution",
        description: "Encrypted shards are distributed across thousands of nodes.",
        icon: Globe,
    },
    {
        number: "04",
        title: "Instant Access",
        description: "Retrieve your data instantly with your private key.",
        icon: Key,
    },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 border-t border-white/10 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                        How It Works
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Simple, secure, and seamless. Get started in minutes.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {steps.map((step, index) => (
                        <div key={index} className="relative group">
                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                                <step.icon className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <span className="text-xs font-mono text-muted-foreground mb-2 block">{step.number}</span>
                                <h3 className="text-lg font-semibold mb-2 text-white">{step.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
