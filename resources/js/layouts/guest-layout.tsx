import { login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

type GuestLayoutProps = {
    title: string;
    showHeader?: boolean;
}

export default function GuestLayout({ children, title, showHeader = true }: PropsWithChildren<GuestLayoutProps>) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title={title}>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
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
            <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)] dark:bg-[var(--bg-dark)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {showHeader && (
                    <header className="fixed top-0 z-50 w-full bg-[var(--bg-light)] shadow-md dark:bg-[var(--bg-light)]">
                        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                            <div className="flex items-center gap-12">
                                <Link href="/" className="relative text-2xl font-bold text-[var(--primary)]">
                                    <span className="gradient-text">NutriBantay</span>
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
                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="rounded-full bg-[var(--primary)] px-6 py-2 font-medium text-white transition-all hover:bg-opacity-90 hover:shadow-md"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="rounded-full border-2 border-[var(--primary)] bg-transparent px-6 py-2 font-medium text-[var(--primary)] transition-all hover:bg-[var(--primary)] hover:text-white hover:shadow-md"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={register()}
                                            className="rounded-full bg-[var(--primary)] px-6 py-2 font-medium text-white transition-all hover:bg-opacity-90 hover:shadow-md"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </header>
                )}

                <main className="mt-16 w-full flex-1">
                    {children}
                </main>

                <footer className="w-full bg-[var(--bg-light)] py-16 dark:bg-[var(--bg-light)]">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-3">
                            <div>
                                <h3 className="mb-3 text-2xl font-bold gradient-text">NutriBantay</h3>
                                <div className="section-divider"></div>
                                <p className="mb-4 text-[var(--text-muted)]">
                                    Empowering our community with nutrition monitoring and health services.
                                </p>
                                <div className="mt-6 flex space-x-4">
                                    <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-white transition-transform hover:scale-110">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                        </svg>
                                    </a>
                                    <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-white transition-transform hover:scale-110">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z"></path>
                                        </svg>
                                    </a>
                                    <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-white transition-transform hover:scale-110">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            <div>
                                <h3 className="mb-3 text-xl font-bold">Quick Links</h3>
                                <div className="section-divider"></div>
                                <ul className="space-y-3">
                                    <li>
                                        <Link href="/" className="flex items-center text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="9 18 15 12 9 6"></polyline>
                                            </svg>
                                            Home
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/announcements" className="flex items-center text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="9 18 15 12 9 6"></polyline>
                                            </svg>
                                            Announcements
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/contact" className="flex items-center text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-[var(--primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                            <circle cx="12" cy="10" r="3"></circle>
                                        </svg>
                                        Barangay Hall, Caloocan City, Philippines
                                    </p>
                                    <p className="mb-3 flex items-center text-[var(--text-muted)]">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-[var(--primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                        </svg>
                                        0912 345 6789
                                    </p>
                                    <p className="flex items-center text-[var(--text-muted)]">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-[var(--primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                            <polyline points="22,6 12,13 2,6"></polyline>
                                        </svg>
                                        info@nutribantay.com
                                    </p>
                                </address>
                            </div>
                        </div>
                        <div className="border-t border-[var(--border-muted)] pt-8 text-center">
                            <p className="text-sm text-[var(--text-muted)]">
                                © {new Date().getFullYear()} NutriBantay. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}