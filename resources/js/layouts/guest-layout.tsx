import { route } from '@/lib/routes';
import { Head, Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useState } from 'react';

type SiteContentValue = { key: string; value: string | null };

type GuestLayoutProps = {
    title: string;
    showHeader?: boolean;
};

export default function GuestLayout({ children, title, showHeader = true }: PropsWithChildren<GuestLayoutProps>) {
    const { footerContent } = usePage<{ footerContent: Record<string, SiteContentValue> }>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const getFooter = (key: string, fallback: string) => footerContent?.[key]?.value ?? fallback;

    return (
        <>
            <Head title={title}>
                <style>{`
                    html, body, #app {
                        font-family: 'Montserrat', sans-serif !important;
                    }
                    * {
                        font-family: inherit;
                    }

                    :root {
                        --bg: #ECFEFF;
                        --bg-dark: #164E63;
                        --bg-light: #F0FDFA;
                        --bg-card: #ffffff;
                        --text: #164E63;
                        --text-muted: #475569;
                        --primary: #0891B2;
                        --secondary: #be185d;
                        --success: #059669;
                        --danger: #dc2626;
                        --warning: #d97706;
                        --info: #0284c7;
                        --border: #E2E8F0;
                        --border-muted: #CBD5E1;

                        --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
                        --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
                        --transition-standard: all 0.2s ease;
                    }

                    .dark {
                        --bg: #0f172a;
                        --bg-dark: #020617;
                        --bg-light: #1e293b;
                        --bg-card: #1e293b;
                        --text: #F1F5F9;
                        --text-muted: #94A3B8;
                        --primary: #22D3EE;
                        --secondary: #fb7185;
                        --success: #34d399;
                        --danger: #f87171;
                        --warning: #fbbf24;
                        --info: #38bdf8;
                        --border: #334155;
                        --border-muted: #475569;
                    }

                    @media (prefers-reduced-motion: no-preference) {
                        html, body, #app {
                            scroll-behavior: smooth;
                        }
                    }

                    @media (prefers-reduced-motion: reduce) {
                        * {
                            animation-duration: 0.01ms !important;
                            animation-iteration-count: 1 !important;
                            transition-duration: 0.01ms !important;
                        }
                    }

                    .skip-link {
                        position: absolute;
                        top: -100%;
                        left: 8px;
                        z-index: 9999;
                        padding: 8px 16px;
                        background: #0891B2;
                        color: white;
                        border-radius: 0 0 8px 8px;
                        font-size: 14px;
                        font-weight: 600;
                        transition: top 0.2s;
                    }
                    .skip-link:focus {
                        top: 0;
                    }
                `}</style>
            </Head>

            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>

            <div
                className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)] dark:bg-[var(--bg-dark)]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
                {showHeader && (
                    <header className="fixed top-0 z-50 w-full border-b border-[var(--border)] bg-white shadow-sm dark:border-[var(--border)] dark:bg-[var(--bg)]">
                        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
                            <div className="flex items-center gap-8 md:gap-12">
                                <Link href="/" className="flex items-center gap-2">
                                    <img src="/NutriBantayLogo.svg" alt="NutriBantay" width="40" height="40" className="h-8 w-auto md:h-10" />
                                    <span className="text-xl font-bold text-[var(--primary)] md:text-2xl">NutriBantay</span>
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
                                    aria-expanded={mobileMenuOpen}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
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

                        {mobileMenuOpen && (
                            <div className="border-t border-[var(--border-muted)] bg-white px-6 py-4 md:hidden dark:bg-[var(--bg)]">
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

                <main id="main-content" className="mt-16 w-full flex-1">
                    {children}
                </main>

                <footer className="w-full border-t border-[var(--border)] bg-white py-16 dark:bg-[var(--bg-light)]">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-3">
                            <div>
                                <div className="mb-3 flex items-center gap-3">
                                    <img src="/NutriBantayLogo.svg" alt="NutriBantay" width="40" height="40" className="h-10 w-auto" />
                                    <h3 className="text-2xl font-bold text-[var(--primary)]">NutriBantay</h3>
                                </div>
                                <p className="mb-4 text-[var(--text-muted)]">
                                    {getFooter('tagline', 'Empowering our community with nutrition monitoring and health services.')}
                                </p>
                                <div className="mt-6">
                                    <a
                                        href={getFooter('facebook_url', 'https://web.facebook.com/profile.php?id=61572504453595')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Follow NutriBantay on Facebook"
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-white transition-all hover:scale-110 hover:bg-[#0a6e8a] hover:shadow-md"
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
                                <h3 className="mb-3 text-xl font-bold text-[var(--text)]">Quick Links</h3>
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
                                <h3 className="mb-3 text-xl font-bold text-[var(--text)]">Contact Info</h3>
                                <address className="not-italic">
                                    <p className="mb-3 flex items-center text-[var(--text-muted)]">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="mr-3 h-5 w-5 shrink-0 text-[var(--primary)]"
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
                                        {getFooter('address', 'Bagong Silang Phase 3 Health Center, Caloocan City, Philippines')}
                                    </p>
                                    <p className="mb-3 flex items-center text-[var(--text-muted)]">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="mr-3 h-5 w-5 shrink-0 text-[var(--primary)]"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                        </svg>
                                        {getFooter('phone', '0966 822 1878')}
                                    </p>
                                    <p className="flex items-center text-[var(--text-muted)]">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="mr-3 h-5 w-5 shrink-0 text-[var(--primary)]"
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
                                        {getFooter('email', 'nutribantay@gmail.com')}
                                    </p>
                                </address>
                            </div>
                        </div>
                        <div className="border-t border-[var(--border-muted)] pt-8 text-center">
                            <p className="text-sm text-[var(--text-muted)]">&copy; {new Date().getFullYear()} {getFooter('copyright_text', 'NutriBantay. All rights reserved.')}</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
