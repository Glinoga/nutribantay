import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { route } from '@/lib/routes';
import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    isMaintenanceMode?: boolean;
    maintenance?: string;
}

export default function Login({ status, canResetPassword, isMaintenanceMode, maintenance }: LoginProps) {
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!termsAccepted) return;
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
                <div className="flex w-full items-center justify-center bg-black p-6 text-white md:w-1/2 md:p-10 dark:text-gray-200">
                    <h1 className="text-center text-2xl leading-snug font-extrabold md:text-left md:text-3xl">
                        NUTRIBANTAY: A TRACKING SYSTEM FOR BARANGAY 176B IN CALOOCAN CITY
                    </h1>
                </div>

                {/* Right Panel */}
                <div className="flex w-full flex-col justify-center bg-[#E8F8F8] p-6 md:w-1/2 md:p-12 dark:bg-gray-900 dark:text-gray-100">
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
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
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

                            {canResetPassword && (
                                <div className="flex justify-end">
                                    <TextLink href={route('password.request')} className="text-sm">
                                        Forgot password?
                                    </TextLink>
                                </div>
                            )}

                            {/* Terms & Conditions Checkbox */}
                            <div className="flex items-start gap-2">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                                <Label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                                    I agree to the{' '}
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <button type="button" className="cursor-pointer text-sm text-teal-600 underline hover:text-teal-700">
                                                Terms & Conditions
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="max-h-[80vh] overflow-y-auto rounded-xl p-6">
                                            <DialogHeader>
                                                <DialogTitle className="text-xl font-bold text-teal-700 dark:text-teal-400">
                                                    Terms & Conditions
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">1. Acceptance of Terms</h3>
                                                <p>
                                                    By accessing and using NutriBantay — a Web-based Child Nutrition Monitoring System for Barangay
                                                    176B in Caloocan City — you agree to be bound by these Terms & Conditions. If you do not agree
                                                    with any part of these terms, you must not use the system.
                                                </p>

                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">2. System Use</h3>
                                                <p>
                                                    NutriBantay is intended for authorized health workers and administrators to register and manage
                                                    child health profiles, track nutrition indicators (BMI-for-age, weight-for-age, height-for-age,
                                                    and z-scores) using WHO Child Growth Standards, flag children at nutritional risk, view progress
                                                    dashboards and reports, deliver announcements, track vaccinations, immunizations, and vitamins,
                                                    and generate AI-assisted nutrition recommendations. You are responsible for maintaining the
                                                    confidentiality of your account credentials.
                                                </p>

                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">3. Data Privacy</h3>
                                                <p>
                                                    All personal and health data stored in NutriBantay is treated as confidential and is protected
                                                    under applicable data privacy laws. Access to data is limited to authorized personnel only.
                                                </p>

                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">4. Acceptable Use</h3>
                                                <p>
                                                    You agree to use NutriBantay solely for its intended purpose — monitoring and managing child
                                                    nutrition and health records. Any unauthorized access, data extraction, or misuse of the system is
                                                    strictly prohibited.
                                                </p>

                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">5. Limitation of Liability</h3>
                                                <p>
                                                    NutriBantay is provided &quot;as is&quot; without warranties of any kind. The system does not
                                                    provide medical diagnoses or replace consultations with certified health professionals.
                                                    AI-generated nutrition recommendations must be reviewed by a health worker before implementation.
                                                    The system requires a stable internet connection and is accessible only through a web browser (no
                                                    native mobile application). It does not integrate with government databases (e.g., DOH, NNC,
                                                    CHITS). The barangay and its developers shall not be held liable for any damages arising from the
                                                    use of the system.
                                                </p>

                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">6. Changes to Terms</h3>
                                                <p>
                                                    We reserve the right to update these terms at any time. Continued use of the system after changes
                                                    constitutes acceptance of the updated terms.
                                                </p>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </Label>
                            </div>

                            {/* Submit */}
                            <Button type="submit" className="w-full" disabled={processing || !termsAccepted}>
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Log in
                            </Button>
                        </div>

                        {/* Footer */}
                        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <TextLink href={route('register')} className="font-medium">
                                Sign Up
                            </TextLink>
                        </div>
                    </form>

                    {status && <div className="mt-4 text-center text-sm font-medium text-green-600 dark:text-green-400">{status}</div>}
                </div>
            </div>
        </div>
    );
}
