import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Create',
        href: route('users.index'),
    },
];

export default function Create() {
    const { data, setData, errors, post, processing } = useForm({
        name: '',
        email: '',
        password: '',
        role: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('users.store'));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="m-4 mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">Create User</h1>
                <Button variant="secondary" asChild>
                    <Link href={route('users.index')}>Back</Link>
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
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="Enter email address"
                        required
                    />
                    {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Min 10 characters with letters and numbers"
                        required
                    />
                    {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password}</p>}
                </div>

                {/* Role Dropdown */}
                <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={data.role} onValueChange={(value) => setData('role', value)} required>
                        <SelectTrigger id="role" className="w-full">
                            <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="healthworker">Health Worker</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.role && <p className="mt-1 text-sm text-destructive">{errors.role}</p>}
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" asChild>
                        <Link href={route('users.index')}>Cancel</Link>
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
