import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Megaphone, OctagonAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { route } from '@/lib/routes';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create an Announcement',
        href: '/admin/announcements/create',
    },
];

export default function Create() {

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        date: '',
        end_date: '',
        summary: '',
        content: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('announcements.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create an Announcement" />
            <div className="m-4 border rounded-lg p-4">

                {/* Add kayo dito ng display error */}

                {Object.keys(errors).length > 0 && (
                    <div className="mb-4 p-4 border border-red-600 bg-red-100 text-red-700 rounded">
                        <div className="list-none list-inside ">
                            <OctagonAlert className='inline-block mr-2' size={24} />
                            {Object.entries(errors).map(([field, message]) => (
                                <li className='inline-block text-md align-content-center' key={field}>{message}</li>
                            ))}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Megaphone size={24} />
                        Create an Announcement
                    </h1>
                    <div className="w-auto p-4 border rounded-lg mb-2 gap-1.5">
                        <Label className="mb-2 block font-medium text-gray-700">Announcement Title</Label>
                        <Input type="text" className="mb-4 w-full" placeholder="Enter announcement title" value={data.title} onChange={e => setData('title', e.target.value)} />
                    </div>
                    <div className="w-auto mb-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className='border rounded-lg p-4'>
                                <Label className="w-auto mb-1 block font-medium text-gray-700">Date</Label>
                                <p className="text-xs text-[var(--muted-foreground)] mb-2">Specify a date to when you want the post to be published. </p>
                                <Input type="date" className="w-full" placeholder="Enter announcement Date" value={data.date} onChange={e => setData('date', e.target.value)} />
                            </div>
                            <div className='border rounded-lg p-4'>
                                <Label className="w-auto mb-1 block font-medium text-gray-700">End Date</Label>
                                <p className="text-xs text-[var(--muted-foreground)] mb-2">Specify an end date to when you want the post to be unpublished.</p>
                                <Input type="date" className="w-full" placeholder="Enter announcement End Date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="w-auto p-4 border rounded-lg mb-2 gap-1.5">
                        <Label className="mb-2 block font-medium text-gray-700">Announcement Summary</Label>
                        <Textarea className="mb-4 w-full" placeholder="Enter announcement Summary" value={data.summary} onChange={e => setData('summary', e.target.value)} />
                    </div>
                    <div className="w-auto p-4 border rounded-lg mb-2 gap-1.5">
                        <Label className="mb-2 block font-medium text-gray-700">Announcement Content</Label>
                        <Textarea className="mb-4 w-full" placeholder="Enter announcement Content" value={data.content} onChange={e => setData('content', e.target.value)} />
                    </div>
                    {/* Image */}
                    <div className="relative overflow-hidden rounded-lg border dark:bg-[var(--bg-light)] gap-1.5 p-4 mb-4">
                        <div className="relative h-96 w-full">
                            {/* Placeholder for the image */}
                            <div className="absolute inset-0 rounded-sm bg-[var(--border)] bg-opacity-20 backdrop-blur-sm">
                                <div className="flex h-full w-full items-center justify-center">
                                    <div className="text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                        <p className="mt-4 text-lg font-medium text-[var(--text)]">Image</p>
                                        <p className="text-[var(--text-muted)]">Image would be displayed here</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button type="submit">Create Announcement</Button>
                </form>
            </div>
        </AppLayout>
    );
}


