import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { route } from '@/lib/routes';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    isMaintenanceMode?: boolean;
    maintenance?: string;
}

export default function Login({ status, canResetPassword, isMaintenanceMode, maintenance }: LoginProps) {
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
            <Head title="Log in" />

            {/* Blurred Background Layer */}
            <div
                className="absolute inset-0 scale-110 bg-cover bg-[center_70%] blur-[4px] filter"
                style={{ backgroundImage: "url('/images/background.jpg')" }}
            />

            {/* Content Layer */}
            <div className="relative z-10 flex w-11/12 max-w-5xl flex-col overflow-hidden rounded-2xl shadow-lg md:flex-row">
                {/* Left Panel */}
                <div className="flex w-full items-center justify-center bg-black p-6 text-white dark:text-gray-200 md:w-1/2 md:p-10">
                    <h1 className="text-center text-2xl leading-snug font-extrabold md:text-left md:text-3xl">NUTRIBANTAY: A TRACKING SYSTEM FOR BARANGAY 176B IN CALOOCAN CITY</h1>
                </div>

                {/* Right Panel */}
                <div className="flex w-full flex-col justify-center bg-[#E8F8F8] p-6 dark:bg-gray-900 dark:text-gray-100 md:w-1/2 md:p-12">
                    <h2 className="mb-6 text-2xl font-bold">Log In</h2>

                    {/* Maintenance Mode Warning from Logout */}
                    {maintenance && (
                        <div className="mb-4 rounded border-l-4 border-red-500 bg-red-100 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            <p className="font-semibold">⚠️ {maintenance}</p>
                        </div>
                    )}

                    {/* Maintenance Mode Banner */}
                    {isMaintenanceMode && (
                        <div className="mb-4 rounded border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            ⚠️ The system is currently in maintenance mode. Only admins can log in.
                        </div>
                    )}

                    <form onSubmit={submit} className="flex flex-col gap-6">
                        <div className="grid gap-4">
                            {/* Login (Code or Email) */}
                            <div className="grid gap-2">
                                <Label htmlFor="login">Registration Code / Email</Label>
                                <Input
                                    id="login"
                                    type="text"
                                    value={data.login}
                                    onChange={(e) => setData('login', e.target.value)}
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    placeholder="Enter your code or email"
                                />
                                <InputError message={errors.login} />
                            </div>

                            {/* Password */}
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Submit */}
                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Log in
                            </Button>
                        </div>

                        {/* Footer */}
                        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <TextLink href={route('register')} className="font-medium">
                                Sign Up
                            </TextLink>{' '}
                            |{' '}
                            <a href="#" className="text-sm underline">
                                Terms & Conditions
                            </a>
                        </div>
                    </form>

                    {status && <div className="mt-4 text-center text-sm font-medium text-green-600 dark:text-green-400">{status}</div>}
                </div>
            </div>
        </div>
    );
}
