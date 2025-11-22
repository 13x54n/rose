import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-background">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-muted-foreground mb-8 backdrop-blur-xl">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
                    Rose Storage v2.0 is now live
                </div>

                <h1 className="text-5xl md:text-8xl font-bold mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                    The Storage Layer for<br />the Decentralized Web.
                </h1>

                <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                    Secure, permanent, and unstoppable. Rose gives you the power to store unlimited data with zero compromise.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/signup"
                        className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full text-lg font-medium transition-all hover:bg-gray-200"
                    >
                        Start Building
                    </Link>
                    <Link
                        href="#features"
                        className="w-full sm:w-auto bg-transparent border border-white/10 text-white px-8 py-4 rounded-full text-lg font-medium transition-all hover:bg-white/5"
                    >
                        Read Documentation
                    </Link>
                </div>
            </div>
        </section>
    );
}
