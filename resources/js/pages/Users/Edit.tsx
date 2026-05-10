import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Edit User',
        href: '/users',
    },
];

type UserEditProps = {
    user: {
        id: number;
        name: string;
        email?: string;
        role?: string;
        barangay?: string;
    };
    isSeededAdmin?: boolean;
};

type UserFormData = {
    name: string;
    email: string;
    role: string;
    barangay: string;
};

export default function Edit({ user, isSeededAdmin }: UserEditProps) {
    const { data, setData, errors, put, processing } = useForm<UserFormData>({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'healthworker',
        barangay: user.barangay ? user.barangay.replace(/^Barangay\s*/i, '') : '',
    });

    // Determine if barangay field should be editable
    const canEditBarangay = isSeededAdmin === true;

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/users/${user.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="m-4 mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">Edit User</h1>
                <Button variant="secondary" asChild>
                    <Link href="/users">Back</Link>
                </Button>
            </div>
            <form onSubmit={submit} className="mx-4 mt-8 max-w-xl space-y-6">
                {/* Name */}
                <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Enter full name"
                        required
                    />
                    {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="Enter email address"
                    />
                    {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
                </div>

                {/* Role Dropdown */}
                <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                        <SelectTrigger id="role" className="w-full">
                            <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="healthworker">Health Worker</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.role && <p className="mt-1 text-sm text-destructive">{errors.role}</p>}
                </div>

                {/* Barangay */}
                <div>
                    <Label htmlFor="barangay">Barangay</Label>
                    <Input
                        id="barangay"
                        type="text"
                        value={data.barangay.replace(/^Barangay\s*/i, '')}
                        onChange={(e) => setData('barangay', e.target.value)}
                        placeholder="Enter barangay"
                        readOnly={!canEditBarangay}
                        className={!canEditBarangay ? 'cursor-not-allowed bg-muted' : ''}
                    />
                    {errors.barangay && <p className="mt-1 text-sm text-destructive">{errors.barangay}</p>}
                    {!canEditBarangay && <p className="mt-1 text-xs text-muted-foreground">Only the main admin can edit this field.</p>}
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/users">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save User'
                        )}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
