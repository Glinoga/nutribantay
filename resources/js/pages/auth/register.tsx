import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { route } from '@/lib/routes';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
            <Head title="Register" />

            {/* Blurred Background Layer */}
            <div
                className="absolute inset-0 scale-110 bg-cover bg-[center_70%] blur-[4px] filter"
                style={{ backgroundImage: "url('/images/background.jpg')" }}
            />

            {/* Content Layer */}
            <div className="relative z-10 flex w-11/12 max-w-5xl flex-col overflow-hidden rounded-2xl shadow-lg md:flex-row">
                {/* Left Panel */}
                <div className="flex w-full items-center justify-center bg-black p-6 text-white md:w-1/2 md:p-10 dark:text-gray-200">
                    <h1 className="text-center text-2xl leading-snug font-extrabold md:text-left md:text-3xl">
                        NUTRIBANTAY: A TRACKING SYSTEM FOR BARANGAY 176B IN CALOOCAN CITY
                    </h1>
                </div>

                {/* Right Panel */}
                <div className="flex w-full flex-col justify-center bg-[#E8F8F8] p-6 md:w-1/2 md:p-12 dark:bg-gray-900 dark:text-gray-100">
                    <h2 className="mb-6 text-2xl font-bold">Sign Up</h2>

                    <Form method="post" action="register" resetOnSuccess={['password', 'password_confirmation']} className="flex flex-col gap-6">
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-4">
                                    {/* Name */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            name="name"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="name"
                                            placeholder="Full name"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    {/* Email */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            tabIndex={2}
                                            autoComplete="email"
                                            placeholder="email@example.com"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Password */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                required
                                                tabIndex={3}
                                                autoComplete="new-password"
                                                placeholder="Password"
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="password_confirmation"
                                                required
                                                tabIndex={4}
                                                placeholder="Confirm your password"
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <InputError message={errors.password_confirmation} />
                                    </div>

                                    {/* Admin Code */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="registration_code">Admin Code</Label>
                                        <Input
                                            id="registration_code"
                                            type="text"
                                            name="registration_code"
                                            required
                                            tabIndex={6}
                                            placeholder="Enter admin code"
                                        />
                                        <InputError message={errors.registration_code} />
                                    </div>

                                    {/* Submit */}
                                    <Button type="submit" className="w-full" disabled={processing} tabIndex={7}>
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Account
                                    </Button>
                                </div>

                                {/* Footer */}
                                <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                                    Already have an account?{' '}
                                    <TextLink href={route('login')} className="font-medium">
                                        Log In
                                    </TextLink>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </div>
    );
}
