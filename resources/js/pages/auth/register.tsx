import { login } from '@/routes';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        registration_code: '',
        barangay: '', // <-- track barangay
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('register'); // or route('register') if needed
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    {/* Name */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            placeholder="Full name"
                        />
                        <InputError message={form.errors.name} className="mt-2" />
                    </div>

                    {/* Email */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            placeholder="email@example.com"
                        />
                        <InputError message={form.errors.email} />
                    </div>

                    {/* Barangay */}
                    <div className="grid gap-2">
                        <Label htmlFor="barangay">Barangay Number</Label>
                        <Input
                            id="barangay"
                            type="number"
                            min={0}
                            required
                            tabIndex={3}
                            autoComplete="off"
                            value={form.data.barangay}
                            onChange={(e) => form.setData('barangay', e.target.value)}
                            placeholder="Enter your barangay number"
                        />
                        <InputError message={form.errors.barangay} />
                    </div>

                    {/* Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={form.data.password}
                            onChange={(e) => form.setData('password', e.target.value)}
                            placeholder="Password"
                        />
                        <InputError message={form.errors.password} />
                    </div>

                    {/* Confirm Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={5}
                            autoComplete="new-password"
                            value={form.data.password_confirmation}
                            onChange={(e) => form.setData('password_confirmation', e.target.value)}
                            placeholder="Confirm password"
                        />
                        <InputError message={form.errors.password_confirmation} />
                    </div>

                    {/* Admin Code */}
                    <div className="grid gap-2">
                        <Label htmlFor="registration_code">Admin Code</Label>
                        <Input
                            id="registration_code"
                            type="text"
                            required
                            tabIndex={6}
                            value={form.data.registration_code}
                            onChange={(e) => form.setData('registration_code', e.target.value)}
                            placeholder="Enter admin code"
                        />
                        <InputError message={form.errors.registration_code} />
                    </div>

                    {/* Submit */}
                    <Button type="submit" className="mt-2 w-full" tabIndex={7} disabled={form.processing}>
                        {form.processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                </div>

                <div className="mt-4 text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href={login()} tabIndex={8}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
