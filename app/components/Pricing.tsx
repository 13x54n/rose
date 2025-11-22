import Link from 'next/link';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
    {
        name: "Starter",
        price: "$0",
        period: "/month",
        description: "For personal projects.",
        features: ["10GB Storage", "Basic Encryption", "Community Support", "1 Node Access"],
        cta: "Start for Free",
        popular: false,
    },
    {
        name: "Pro",
        price: "$29",
        period: "/month",
        description: "For growing teams.",
        features: ["1TB Storage", "Advanced Encryption", "Priority Support", "Unlimited Node Access", "API Access"],
        cta: "Get Pro",
        popular: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "",
        description: "For large organizations.",
        features: ["Unlimited Storage", "Custom Encryption Keys", "24/7 Dedicated Support", "Private Nodes", "SLA Guarantee"],
        cta: "Contact Sales",
        popular: false,
    },
];

export default function Pricing() {
    return (
        <section id="pricing" className="py-24 border-t border-white/10 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                        Simple Pricing
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Transparent pricing for everyone. No hidden fees.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={cn(
                                "relative flex flex-col p-8 rounded-2xl border bg-background transition-all duration-200",
                                plan.popular
                                    ? "border-white/20 shadow-2xl shadow-white/5 scale-105 z-10"
                                    : "border-white/10 hover:border-white/20"
                            )}
                        >
                            <div className="mb-8">
                                <h3 className="text-lg font-medium mb-2">{plan.name}</h3>
                                <div className="flex items-baseline mb-4">
                                    <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                                </div>
                                <p className="text-muted-foreground text-sm">{plan.description}</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center text-sm text-muted-foreground">
                                        <Check className="w-4 h-4 text-white mr-3 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/signup"
                                className={cn(
                                    "w-full block text-center py-3 rounded-lg font-medium text-sm transition-colors",
                                    plan.popular
                                        ? "bg-white text-black hover:bg-gray-200"
                                        : "bg-white/5 text-white hover:bg-white/10"
                                )}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
