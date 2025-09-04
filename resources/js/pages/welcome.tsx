import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-between gap-4">
                        <Link
                            href="/announcements"
                            className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                        >
                            Announcements
                        </Link>
                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </header>
                <div className="hidden h-14.5 lg:block"></div>

                {/* Barangay Description Section */}
                <section className="m-8 w-full max-w-2xl text-center">
                    <h2 className="mb-2 text-2xl font-bold">Welcome to Barangay Placeholder</h2>
                    <p className="text-base text-gray-700 dark:text-gray-300">
                        Barangay Placeholder is a vibrant community located in Caloocan City. This nutrition tracking system, Nutribantay, aims to
                        help residents monitor and improve their nutritional health. Explore the highlights of our barangay below!
                    </p>
                </section>

                {/* Highlights Section */}
                <section className="mb-8 w-full max-w-4xl">
                    <h3 className="mb-4 text-center text-xl font-semibold">Barangay Highlights</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Placeholder images */}
                        <div className="flex flex-col items-center">
                            <div className="mb-2 flex h-32 w-48 items-center justify-center rounded-lg bg-gray-200">
                                <span className="text-gray-500">Image 1</span>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Health Center</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="mb-2 flex h-32 w-48 items-center justify-center rounded-lg bg-gray-200">
                                <span className="text-gray-500">Image 2</span>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Community Hall</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="mb-2 flex h-32 w-48 items-center justify-center rounded-lg bg-gray-200">
                                <span className="text-gray-500">Image 3</span>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Playground</span>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
