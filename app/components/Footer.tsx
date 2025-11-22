import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-background border-t border-white/10 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="text-xl font-bold tracking-tight mb-4 inline-block">
                            Rose
                        </Link>
                        <p className="text-muted-foreground max-w-sm text-sm">
                            The storage layer for the decentralized web. Secure, permanent, and unstoppable.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-sm">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                            <li><Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">API</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Changelog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-sm">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
                    <p className="mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} Rose Storage. All rights reserved.
                    </p>
                    <div className="flex space-x-6">
                        <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
