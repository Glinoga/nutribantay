import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Mail, MapPin, Pencil, QrCode, Shield, User, Users } from 'lucide-react';

type UserShowProps = {
    user: {
        id: number;
        name: string;
        email: string;
        roles?: string[];
        barangay?: string;
        status?: string;
        registration_code?: string;
        created_at?: string;
    };
};

export default function Show({ user }: UserShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'User Management', href: route('users.index') },
        { title: user.name, href: route('users.show', { user: user.id }) },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Approved
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Pending
                    </Badge>
                );
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Details" />

            <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-cyan-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(13,148,136,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.12),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    {/* Pill Badge */}
                    <div className="mb-6 text-center">
                        <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-teal-100/50 bg-white/90 px-6 py-3 shadow-lg backdrop-blur-sm dark:border-teal-800/50 dark:bg-gray-800/90">
                                <Users className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                                <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">User Management</span>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-3xl font-bold text-transparent">
                                User Details
                            </h1>
                            <p className="mt-1 flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <User className="h-4 w-4" />
                                {user.name}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="border hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700" asChild>
                                <Link href={route('users.index')}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Link>
                            </Button>
                            <Button
                                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md transition-all duration-300 hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg"
                                asChild
                            >
                                <Link href={route('users.edit', { user: user.id })}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit User
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="mx-auto max-w-2xl space-y-6">
                        {/* Basic Information Card */}
                        <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 dark:border-gray-700">
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                    Basic Information
                                </CardTitle>
                                <CardDescription>User account details</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <dl className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-muted-foreground">Name</Label>
                                        <dd className="mt-1 flex items-center gap-2 font-medium">
                                            <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            {user.name}
                                        </dd>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Email</Label>
                                        <dd className="mt-1 flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            {user.email}
                                        </dd>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">User ID</Label>
                                        <dd className="mt-1 font-mono text-sm">{user.id}</dd>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Created</Label>
                                        <dd className="mt-1 flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                        </dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        {/* Role & Status Card */}
                        {(user.roles || user.status) && (
                            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                                <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 dark:border-gray-700">
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                        Role & Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <dl className="grid grid-cols-2 gap-4">
                                        {user.roles && (
                                            <div>
                                                <Label className="text-muted-foreground">Role</Label>
                                                <dd className="mt-1 flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                    <Badge variant="outline">{user.roles.join(', ')}</Badge>
                                                </dd>
                                            </div>
                                        )}
                                        {user.status && (
                                            <div>
                                                <Label className="text-muted-foreground">Status</Label>
                                                <dd className="mt-1">{getStatusBadge(user.status)}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </CardContent>
                            </Card>
                        )}

                        {/* Additional Information Card */}
                        {user.registration_code && (
                            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                                <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 dark:border-gray-700">
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                        Additional Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <dl className="grid grid-cols-2 gap-4">
                                        {user.registration_code && (
                                            <div>
                                                <Label className="text-muted-foreground">Registration Code</Label>
                                                <dd className="mt-1 flex items-center gap-2 font-mono text-sm">
                                                    <QrCode className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                    {user.registration_code}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </AppLayout>
    );
}
