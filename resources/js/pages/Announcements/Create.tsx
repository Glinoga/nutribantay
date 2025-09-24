import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Megaphone, OctagonAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { route } from '@/lib/routes';
import { useState } from 'react';

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
        image: null as File | null,
    });

    const [preview, setPreview] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('announcements.store'), {
            forceFormData: true, // required for image upload
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('image', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create an Announcement" />
            <div className="m-4 border rounded-lg p-4">

                {/* Display errors */}
                {Object.keys(errors).length > 0 && (
                    <div className="mb-4 p-4 border border-red-600 bg-red-100 text-red-700 rounded">
                        <div className="list-none list-inside">
                            <OctagonAlert className="inline-block mr-2" size={24} />
                            {Object.entries(errors).map(([field, message]) => (
                                <li className="inline-block text-md" key={field}>
                                    {message}
                                </li>
                            ))}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Megaphone size={24} />
                        Create an Announcement
                    </h1>

                    {/* Title */}
                    <div className="w-auto p-4 border rounded-lg mb-2">
                        <Label className="mb-2 block font-medium text-gray-700">
                            Announcement Title
                        </Label>
                        <Input
                            type="text"
                            className="mb-4 w-full"
                            placeholder="Enter announcement title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                        />
                    </div>

                    {/* Dates */}
                    <div className="w-auto mb-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border rounded-lg p-4">
                                <Label className="block font-medium text-gray-700">Date</Label>
                                <Input
                                    type="date"
                                    className="w-full"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                />
                            </div>
                            <div className="border rounded-lg p-4">
                                <Label className="block font-medium text-gray-700">End Date</Label>
                                <Input
                                    type="date"
                                    className="w-full"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="w-auto p-4 border rounded-lg mb-2">
                        <Label className="mb-2 block font-medium text-gray-700">Summary</Label>
                        <Textarea
                            className="mb-4 w-full"
                            placeholder="Enter summary"
                            value={data.summary}
                            onChange={(e) => setData('summary', e.target.value)}
                        />
                    </div>

                    {/* Content */}
                    <div className="w-auto p-4 border rounded-lg mb-2">
                        <Label className="mb-2 block font-medium text-gray-700">Content</Label>
                        <Textarea
                            className="mb-4 w-full"
                            placeholder="Enter content"
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="w-auto p-4 border rounded-lg mb-2">
                        <Label className="mb-2 block font-medium text-gray-700">Upload Image</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        {preview && (
                            <img
                                src={preview}
                                alt="Preview"
                                className="mt-4 rounded-lg border max-h-64"
                            />
                        )}
                    </div>

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Create Announcement'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
