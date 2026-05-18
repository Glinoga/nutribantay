import { route } from '@/lib/routes';
import { Head, Link } from '@inertiajs/react';
import { PropsWithChildren, useState } from 'react';

type GuestLayoutProps = {
    title: string;
    showHeader?: boolean;
};

export default function GuestLayout({ children, title, showHeader = true }: PropsWithChildren<GuestLayoutProps>) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <Head title={title}>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
                    rel="stylesheet"
                />
                <style>{`
                    html, body, #app {
                        font-family: 'Montserrat', sans-serif !important;
                        scroll-behavior: smooth;
                    }
                    * {
                        font-family: inherit;
                    }
                    
                    @theme {
                        --inset-shadow-sm: inset 0 0 7px 0 hsla(178 100% 95% 1);
                    }

                    /* CSS Variables */
                    :root {
                        --bg-dark: hsl(178 36% 87%);
                        --bg: hsl(178 61% 92%);
                        --bg-light: hsl(178 100% 98%);
                        --text: hsl(181 100% 2%);
                        --text-muted: hsl(179 40% 22%);
                        --highlight: hsl(178 100% 95%);
                        --border: hsl(179 20% 45%);
                        --border-muted: hsl(178 21% 57%);
                        --primary: hsl(180 100% 8%);
                        --secondary: hsl(351 44% 31%);
                        --danger: hsl(9 21% 41%);
                        --warning: hsl(52 23% 34%);
                        --success: hsl(147 19% 36%);
                        --info: hsl(217 22% 41%);

                        --radius-xs: .625rem;
                        --radius-sm: .938rem;
                        --radius-md: 1.25rem;
                        --radius-lg: 100%;

                        
                        
                        /* Additional modern design variables */
                        --box-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
                        --box-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
                        --box-shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
                        --transition-standard: all 0.3s ease;
                    }
                    
                    /* Additional global styles */
                    .card-hover {
                        transition: var(--transition-standard);
                    }
                    .card-hover:hover {
                        transform: translateY(-5px);
                        box-shadow: var(--box-shadow-md);
                    }
                    .gradient-text {
                        background: linear-gradient(90deg, var(--primary), var(--secondary));
                        -webkit-background-clip: text;
                        background-clip: text;
                        color: transparent;
                    }
                    .section-divider {
                        height: 4px;
                        width: 60px;
                        background: linear-gradient(90deg, var(--primary), var(--secondary));
                        margin: 0.5rem 0 1.5rem;
                        border-radius: 2px;
                    }
                `}</style>
            </Head>
            <div
                className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)] dark:bg-[var(--bg-dark)]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
                {showHeader && (
                    <header className="fixed top-0 z-50 z-[1001] w-full bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-sm dark:bg-[var(--bg)]/70 dark:border-b dark:border-[var(--border)]">
                        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
                            <div className="flex items-center gap-8 md:gap-12">
                                <Link href="/" className="flex items-center gap-2">
                                    <img src="/NutriBantay Logo.png" alt="NutriBantay" className="h-8 w-auto md:h-10" />
                                    <span className="text-xl font-bold md:text-2xl gradient-text">NutriBantay</span>
                                </Link>
                                <nav className="hidden space-x-8 md:flex">
                                    <Link
                                        href="/"
                                        className="relative font-medium text-[var(--text)] transition-colors after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-[var(--primary)] after:transition-all hover:text-[var(--primary)] hover:after:w-full"
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        href="/guest/announcements"
                                        className="relative font-medium text-[var(--text)] transition-colors after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-[var(--primary)] after:transition-all hover:text-[var(--primary)] hover:after:w-full"
                                    >
                                        Announcements
                                    </Link>
                                    <Link
                                        href="/guest/contact"
                                        className="relative font-medium text-[var(--text)] transition-colors after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-[var(--primary)] after:transition-all hover:text-[var(--primary)] hover:after:w-full"
                                    >
                                        Contact
                                    </Link>
                                </nav>
                            </div>

                            <div className="flex items-center">
                                <button
                                    className="flex items-center justify-center rounded-lg p-2 text-[var(--primary)] md:hidden"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    aria-label="Toggle navigation menu"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        {mobileMenuOpen ? (
                                            <>
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </>
                                        ) : (
                                            <>
                                                <line x1="3" y1="6" x2="21" y2="6" />
                                                <line x1="3" y1="12" x2="21" y2="12" />
                                                <line x1="3" y1="18" x2="21" y2="18" />
                                            </>
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Mobile navigation dropdown */}
                        {mobileMenuOpen && (
                            <div className="border-t border-[var(--border-muted)] bg-[var(--bg-light)] px-6 py-4 md:hidden">
                                <nav className="flex flex-col space-y-3">
                                    <Link
                                        href="/"
                                        className="font-medium text-[var(--text)] transition-colors hover:text-[var(--primary)]"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        href="/guest/announcements"
                                        className="font-medium text-[var(--text)] transition-colors hover:text-[var(--primary)]"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Announcements
                                    </Link>
                                    <Link
                                        href="/guest/contact"
                                        className="font-medium text-[var(--text)] transition-colors hover:text-[var(--primary)]"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Contact
                                    </Link>
                                </nav>
                            </div>
                        )}
                    </header>
                )}

                <main className="mt-16 w-full flex-1">{children}</main>

                <footer className="w-full bg-[var(--bg-light)] py-16 dark:bg-[var(--bg-light)]">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-3">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <img src="/NutriBantay Logo.png" alt="NutriBantay" className="h-10 w-auto" />
                                    <h3 className="text-2xl font-bold gradient-text">NutriBantay</h3>
                                </div>
                                <div className="section-divider"></div>
                                <p className="mb-4 text-[var(--text-muted)]">
                                    Empowering our community with nutrition monitoring and health services.
                                </p>
                                <div className="mt-6">
                                    <a
                                        href="https://web.facebook.com/profile.php?id=61572504453595"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Follow NutriBantay on Facebook"
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-white transition-all hover:bg-gradient-to-r hover:from-teal-600 hover:to-cyan-500 hover:shadow-md hover:scale-110"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            <div>
                                <h3 className="mb-3 text-xl font-bold">Quick Links</h3>
                                <div className="section-divider"></div>
                                <ul className="space-y-3">
                                    <li>
                                        <Link
                                            href="/"
                                            className="flex items-center text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="mr-2 h-4 w-4"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="9 18 15 12 9 6"></polyline>
                                            </svg>
                                            Home
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route('guest.announcements')}
                                            className="flex items-center text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="mr-2 h-4 w-4"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="9 18 15 12 9 6"></polyline>
                                            </svg>
                                            Announcements
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route('guest.contact')}
                                            className="flex items-center text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="mr-2 h-4 w-4"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="9 18 15 12 9 6"></polyline>
                                            </svg>
                                            Contact
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="mb-3 text-xl font-bold">Contact Info</h3>
                                <div className="section-divider"></div>
                                <address className="not-italic">
                                    <p className="mb-3 flex items-center text-[var(--text-muted)]">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="mr-3 h-5 w-5 text-[var(--primary)]"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                            <circle cx="12" cy="10" r="3"></circle>
                                        </svg>
                                        Bagong Silang Phase 3 Health Center, Caloocan City, Philippines
                                    </p>
                                    <p className="mb-3 flex items-center text-[var(--text-muted)]">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="mr-3 h-5 w-5 text-[var(--primary)]"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                        </svg>
                                        0966 822 1878
                                    </p>
                                    <p className="flex items-center text-[var(--text-muted)]">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="mr-3 h-5 w-5 text-[var(--primary)]"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                            <polyline points="22,6 12,13 2,6"></polyline>
                                        </svg>
                                        nutribantay@gmail.com
                                    </p>
                                </address>
                            </div>
                        </div>
                        <div className="border-t border-[var(--border-muted)] pt-8 text-center">
                            <p className="text-sm text-[var(--text-muted)]">© {new Date().getFullYear()} NutriBantay. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
