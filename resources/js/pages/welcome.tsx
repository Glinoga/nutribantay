import { route } from '@/lib/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=montserrat:400,500,600,700,800" rel="stylesheet" />
                <style>{`
                    html, body, #app {
                        font-family: 'Montserrat', sans-serif !important;
                        scroll-behavior: smooth;
                    }
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in-up {
                        animation: fadeInUp 0.6s ease-out forwards;
                    }
                    .glass-card {
                        background: rgba(255, 255, 255, 0.7);
                        backdrop-filter: blur(12px);
                        -webkit-backdrop-filter: blur(12px);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                    }
                    .card-hover {
                        transition: all 0.3s ease;
                    }
                    .card-hover:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                    }
                    .gradient-text {
                        background: linear-gradient(90deg, hsl(180, 100%, 8%), hsl(180, 80%, 30%));
                        -webkit-background-clip: text;
                        background-clip: text;
                        color: transparent;
                    }
                `}</style>
            </Head>

            <div
                className="relative flex min-h-screen flex-col items-center overflow-hidden bg-gradient-to-br from-[hsl(178,100%,98%)] via-[hsl(178,61%,92%)] to-[hsl(178,36%,87%)] p-6 lg:justify-center lg:p-8"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
                {/* Radial Overlay */}
                <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[hsl(180,100%,8%)] opacity-[0.03] blur-3xl"></div>
                <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[hsl(180,80%,30%)] opacity-[0.03] blur-3xl"></div>

                {/* Glassmorphic Nav */}
                <header className="animate-fade-in-up fixed top-4 z-50 w-full max-w-[335px] lg:max-w-4xl" style={{ animationDelay: '0.1s' }}>
                    <nav className="glass-card flex items-center justify-between gap-4 rounded-full px-6 py-2.5 shadow-lg">
                        <Link
                            href={route('guest.announcements')}
                            className="rounded-full px-4 py-1.5 text-sm font-medium text-[hsl(179,40%,22%)] transition-all hover:bg-[hsl(178,100%,8%)] hover:text-white"
                        >
                            Announcements
                        </Link>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-full bg-[hsl(180,100%,8%)] px-5 py-1.5 text-sm font-medium text-white transition-all hover:shadow-md"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-full px-4 py-1.5 text-sm font-medium text-[hsl(179,40%,22%)] transition-all hover:bg-[hsl(178,100%,8%)] hover:text-white"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-full bg-[hsl(180,100%,8%)] px-5 py-1.5 text-sm font-medium text-white transition-all hover:shadow-md"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                <div className="hidden h-14.5 lg:block"></div>

                {/* Hero Section */}
                <section className="animate-fade-in-up m-8 w-full max-w-2xl text-center" style={{ animationDelay: '0.3s' }}>
                    <span className="mb-3 inline-block rounded-full bg-white/80 px-4 py-1 text-xs font-medium text-[hsl(180,100%,8%)] shadow-sm backdrop-blur-sm">
                        WELCOME
                    </span>
                    <h1 className="mb-2 text-3xl font-bold md:text-4xl">
                        <div className="flex items-center justify-center gap-3">
                            <img src="/NutriBantay Logo.svg" alt="NutriBantay" className="h-10 w-auto md:h-14" />
                            <span className="gradient-text">NutriBantay</span>
                        </div>
                    </h1>
                    <div className="glass-card mx-auto mt-6 max-w-xl rounded-2xl p-6 text-center">
                        <p className="text-base leading-relaxed text-[hsl(179,40%,22%)]">
                            Barangay 176B is a vibrant community located in Caloocan City. This nutrition tracking system, NutriBantay, aims to help
                            residents monitor and improve their nutritional health. Explore the highlights of our barangay below!
                        </p>
                    </div>
                </section>

                {/* Highlights Section */}
                <section className="animate-fade-in-up mb-8 w-full max-w-4xl" style={{ animationDelay: '0.5s' }}>
                    <h3 className="mb-8 text-center text-xl font-semibold text-[hsl(181,100%,2%)]">Barangay Highlights</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Health Center */}
                        <div className="card-hover glass-card flex flex-col items-center rounded-2xl p-8 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(180,100%,8%)] text-white">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-[hsl(179,40%,22%)]">Health Center</span>
                            <p className="mt-2 text-xs text-[hsl(179,40%,22%)]/70">Phase 3 Bagong Silang</p>
                        </div>

                        {/* Community Hall */}
                        <div className="card-hover glass-card flex flex-col items-center rounded-2xl p-8 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(180,100%,8%)] text-white">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-[hsl(179,40%,22%)]">Community Hall</span>
                            <p className="mt-2 text-xs text-[hsl(179,40%,22%)]/70">Barangay Center</p>
                        </div>

                        {/* Playground */}
                        <div className="card-hover glass-card flex flex-col items-center rounded-2xl p-8 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(180,100%,8%)] text-white">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                    <line x1="9" y1="9" x2="9.01" y2="9" />
                                    <line x1="15" y1="9" x2="15.01" y2="9" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-[hsl(179,40%,22%)]">Playground</span>
                            <p className="mt-2 text-xs text-[hsl(179,40%,22%)]/70">Community Park</p>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
