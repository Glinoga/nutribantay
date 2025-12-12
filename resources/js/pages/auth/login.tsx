import { store } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { register } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    isMaintenanceMode?: boolean;
    maintenance?: string;
}

export default function Login({ status, canResetPassword, isMaintenanceMode, maintenance }: LoginProps) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
            <Head title="Log in" />

            {/* Blurred Background Layer */}
            <div
                className="absolute inset-0 scale-110 bg-cover bg-[center_70%] blur-[4px] filter"
                style={{ backgroundImage: "url('/images/background.jpg')" }}
            />

            {/* Content Layer */}
            <div className="relative z-10 flex w-11/12 max-w-5xl overflow-hidden rounded-2xl shadow-lg">
                {/* Left Panel */}
                <div className="flex w-1/2 items-center justify-center bg-black p-10 text-white">
                    <h1 className="text-3xl leading-snug font-extrabold">NUTRIBANTAY: A TRACKING SYSTEM FOR BARANGAY 1 IN CALOOCAN CITY</h1>
                </div>

                {/* Right Panel */}
                <div className="flex w-1/2 flex-col justify-center bg-[#E8F8F8] p-12">
                    <h2 className="mb-6 text-2xl font-bold">Log In</h2>

                    {/* Maintenance Mode Warning from Logout */}
                    {maintenance && (
                        <div className="mb-4 rounded border-l-4 border-red-500 bg-red-100 p-4 text-red-800">
                            <p className="font-semibold">⚠️ {maintenance}</p>
                        </div>
                    )}

                    {/* Maintenance Mode Banner */}
                    {isMaintenanceMode && (
                        <div className="mb-4 rounded border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-800">
                            ⚠️ The system is currently in maintenance mode. Only admins can log in.
                        </div>
                    )}

                    <Form {...store.form()} resetOnSuccess={['password']} className="flex flex-col gap-6">
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-4">
                                    {/* Email */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="Enter your email"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Password */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Submit */}
                                    <Button type="submit" className="w-full bg-teal-700 hover:bg-teal-800" disabled={processing}>
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Log in
                                    </Button>
                                </div>

                                {/* Footer */}
                                <div className="mt-4 text-center text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <TextLink href={register()} className="font-medium">
                                        Sign Up
                                    </TextLink>{' '}
                                    |{' '}
                                    <a href="#" className="text-sm underline">
                                        Terms & Conditions
                                    </a>
                                </div>
                            </>
                        )}
                    </Form>

                    {status && <div className="mt-4 text-center text-sm font-medium text-green-600">{status}</div>}
                </div>
            </div>
        </div>
    );
}
