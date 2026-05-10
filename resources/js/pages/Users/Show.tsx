import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User',
        href: '/users',
    },
];

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
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        Approved
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-800">
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
            <div className="m-4 mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">User Details</h1>
                <div className="flex gap-2">
                    <Button variant="secondary" asChild>
                        <Link href="/users">Back</Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/users/${user.id}/edit`}>Edit User</Link>
                    </Button>
                </div>
            </div>

            <div className="mx-4 mt-8 max-w-2xl space-y-6">
                {/* Basic Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>User account details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-muted-foreground">Name</Label>
                                <dd className="mt-1 font-medium">{user.name}</dd>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Email</Label>
                                <dd className="mt-1">{user.email}</dd>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">User ID</Label>
                                <dd className="mt-1 font-mono text-sm">{user.id}</dd>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Created</Label>
                                <dd className="mt-1 text-sm">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                {/* Role & Status Card */}
                {(user.roles || user.status) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Role & Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-2 gap-4">
                                {user.roles && (
                                    <div>
                                        <Label className="text-muted-foreground">Role</Label>
                                        <dd className="mt-1">
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
                {(user.barangay || user.registration_code) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-2 gap-4">
                                {user.barangay && (
                                    <div>
                                        <Label className="text-muted-foreground">Barangay</Label>
                                        <dd className="mt-1">{user.barangay}</dd>
                                    </div>
                                )}
                                {user.registration_code && (
                                    <div>
                                        <Label className="text-muted-foreground">Registration Code</Label>
                                        <dd className="mt-1 font-mono text-sm">{user.registration_code}</dd>
                                    </div>
                                )}
                            </dl>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
