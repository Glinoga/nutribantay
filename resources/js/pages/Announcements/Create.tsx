import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Megaphone, OctagonAlert } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create an Announcement',
        href: '/admin/announcements/create',
    },
];

interface Category {
    id: number;
    name: string;
    slug: string;
    color: string;
    description?: string;
}

interface CreateProps {
    categories: Category[];
}

export default function Create({ categories }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        date: '',
        end_date: '',
        category_id: '',
        author: '',
        summary: '',
        content: '',
        image: null as File | null,
    });

    const [preview, setPreview] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('announcements.store'), {
            forceFormData: true,
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

            <div className="m-4">
                {/* Button to open modal */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Megaphone size={20} />
                            Create Announcement
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                                <Megaphone size={24} />
                                Create an Announcement
                            </DialogTitle>
                        </DialogHeader>

                        {/* Display errors */}
                        {Object.keys(errors).length > 0 && (
                            <div className="mb-4 rounded border border-red-600 bg-red-100 p-4 text-red-700">
                                <div className="list-inside list-none">
                                    <OctagonAlert className="mr-2 inline-block" size={24} />
                                    {Object.entries(errors).map(([field, message]) => (
                                        <li className="text-md inline-block" key={field}>
                                            {message}
                                        </li>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} encType="multipart/form-data">
                            {/* Title */}
                            <div className="mb-2 w-auto rounded-lg border p-4">
                                <Label className="mb-2 block font-medium text-gray-700">Announcement Title</Label>
                                <Input
                                    type="text"
                                    placeholder="Enter announcement title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                            </div>

                            {/* Category & Author */}
                            <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="rounded-lg border p-4">
                                    <Label className="block font-medium text-gray-700">Category</Label>
                                    <p className="mt-1 mb-2 text-xs text-[var(--muted-foreground)]">Select the category for this announcement</p>
                                    <Select value={data.category_id.toString()} onValueChange={(value) => setData('category_id', value)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <Label className="block font-medium text-gray-700">Author</Label>
                                    <p className="mt-1 mb-2 text-xs text-[var(--muted-foreground)]">Who is publishing this announcement</p>
                                    <Input
                                        type="text"
                                        placeholder="Enter author name"
                                        value={data.author}
                                        onChange={(e) => setData('author', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="rounded-lg border p-4">
                                    <Label className="block font-medium text-gray-700">Date</Label>
                                    <Input type="date" className="mt-2 w-full" value={data.date} onChange={(e) => setData('date', e.target.value)} />
                                </div>
                                <div className="rounded-lg border p-4">
                                    <Label className="block font-medium text-gray-700">End Date</Label>
                                    <Input
                                        type="date"
                                        className="mt-2 w-full"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="mb-2 w-auto rounded-lg border p-4">
                                <Label className="mb-2 block font-medium text-gray-700">Summary</Label>
                                <Textarea placeholder="Enter summary" value={data.summary} onChange={(e) => setData('summary', e.target.value)} />
                            </div>

                            {/* Content */}
                            <div className="mb-2 w-auto rounded-lg border p-4">
                                <Label className="mb-2 block font-medium text-gray-700">Content</Label>
                                <Textarea placeholder="Enter content" value={data.content} onChange={(e) => setData('content', e.target.value)} />
                            </div>

                            {/* Image Upload */}
                            <div className="mb-2 w-auto rounded-lg border p-4">
                                <Label className="mb-2 block font-medium text-gray-700">Upload Image</Label>
                                <Input type="file" accept="image/*" onChange={handleImageChange} />
                                {preview && <img src={preview} alt="Preview" className="mt-4 max-h-64 rounded-lg border" />}
                            </div>

                            <Button type="submit" disabled={processing} className="mt-4">
                                {processing ? 'Saving...' : 'Create Announcement'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
