import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

export default function Register() {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
            <Head title="Register" />

            {/* Blurred Background Layer */}
            <div
                className="absolute inset-0 scale-110 bg-cover bg-[center_70%] blur-[4px] filter"
                style={{ backgroundImage: "url('/images/background.jpg')" }}
            />

            {/* Content Layer */}
            <div className="relative z-10 flex h-[650px] w-11/12 max-w-5xl overflow-hidden rounded-2xl shadow-lg">
                {/* Left Panel */}
                <div className="flex w-1/2 items-center justify-center bg-black p-10 text-white">
                    <h1 className="text-3xl leading-snug font-extrabold">NUTRIBANTAY: A TRACKING SYSTEM FOR BARANGAY 1 IN CALOOCAN CITY</h1>
                </div>

                {/* Right Panel */}
                <div className="flex w-1/2 flex-col justify-center bg-[#E8F8F8] p-12">
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

                                    {/* Barangay */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="barangay">Barangay Number</Label>
                                        <Input
                                            id="barangay"
                                            type="number"
                                            name="barangay"
                                            min={0}
                                            required
                                            tabIndex={3}
                                            placeholder="Enter your barangay number"
                                        />
                                        <InputError message={errors.barangay} />
                                    </div>

                                    {/* Password */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            required
                                            tabIndex={4}
                                            autoComplete="new-password"
                                            placeholder="Password"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            name="password_confirmation"
                                            required
                                            tabIndex={5}
                                            autoComplete="new-password"
                                            placeholder="Confirm password"
                                        />
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
                                    <Button type="submit" className="w-full bg-teal-700 hover:bg-teal-800" disabled={processing} tabIndex={7}>
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Account
                                    </Button>
                                </div>

                                {/* Footer */}
                                <div className="mt-4 text-center text-sm text-gray-600">
                                    Already have an account?{' '}
                                    <TextLink href={login()} className="font-medium">
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
