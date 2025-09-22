import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { route } from '@/lib/routes';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Announcements',
        href: '/admin/announcements',
    },
];

export default function Index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Announcements" />
            <div className="m-4">
                <Link href={route('announcements.create')}>
                    <Button>New Announcement</Button>
                </Link>
            </div>
        </AppLayout>
    );
}
