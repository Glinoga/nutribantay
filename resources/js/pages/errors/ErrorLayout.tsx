import { Head } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface ErrorLayoutProps {
    title: string;
}

export default function ErrorLayout({ title, children }: PropsWithChildren<ErrorLayoutProps>) {
    return (
        <>
            <Head title={title}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=montserrat:400,500,600,700,800" rel="stylesheet" />
                <style>{`
                    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
                    .error-animate { animation: fadeInUp 0.5s ease-out forwards; }
                    .error-float { animation: float 4s ease-in-out infinite; }
                    @media (prefers-reduced-motion: reduce) { .error-animate { animation: none; } .error-float { animation: none; } }
                `}</style>
            </Head>
            <div
                className="flex min-h-screen flex-col bg-background text-foreground"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
                <main className="flex flex-1 items-center justify-center px-4 py-12">
                    {children}
                </main>
                <footer className="border-t border-border py-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} NutriBantay.
                        Need help?{' '}
                        <a
                            href="mailto:nutribantay@gmail.com"
                            className="font-medium text-primary hover:underline"
                        >
                            Contact Support
                        </a>
                    </p>
                </footer>
            </div>
        </>
    );
}
