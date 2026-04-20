import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { router } from "@inertiajs/react";
import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { Megaphone, OctagonAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { route } from '@/lib/routes';
import { smartToast } from '@/utils/smartToast';

// Types
interface Category {
    id: number;
    name: string;
    slug: string;
    color: string;
    description?: string;
}

interface Announcement {
    id: number;
    title: string;
    date: string;
    end_date: string | null;
    category_id: number;
    author: string | null;
    summary: string;
    content: string;
    image?: string | null;
    image_url?: string | null; // <-- use accessor for display
}

interface EditProps {
    announcement: Announcement;
    categories: Category[];
}

export default function Edit({ announcement, categories }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        title: announcement.title || "",
        date: announcement.date || "",
        end_date: announcement.end_date || "",
        category_id: announcement.category_id ? announcement.category_id.toString() : "",
        author: announcement.author || "",
        summary: announcement.summary || "",
        content: announcement.content || "",
        image: null as File | null,
    });

    const [preview, setPreview] = useState<string | null>(
        announcement.image_url ?? (announcement.image ? `/storage/${announcement.image}` : null)
    );

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('image', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Show loading toast
        const loadingToast = smartToast.loading('Updating announcement...');

        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("date", data.date);
        formData.append("end_date", data.end_date || "");
        formData.append("category_id", data.category_id);
        formData.append("author", data.author || "");
        formData.append("summary", data.summary);
        formData.append("content", data.content);

        if (data.image) {
            formData.append("image", data.image); 
        }

        // Important: tell Laravel this is a PUT request
        formData.append("_method", "PUT");

        // Use router.post instead of put()
        router.post(route("announcements.update", { announcement: announcement.id }), formData, {
            forceFormData: true, // ✅ required for files
            preserveScroll: true,
            onSuccess: () => {
                smartToast.dismiss(loadingToast);
                smartToast.success('Announcement updated successfully! 🎉');
            },
            onError: (errors) => {
                smartToast.dismiss(loadingToast);
                // Show specific error messages
                const errorMessages = Object.values(errors).flat();
                if (errorMessages.length > 0) {
                    errorMessages.forEach((error) => {
                        smartToast.error(error as string);
                    });
                } else {
                    smartToast.error('Failed to update announcement. Please try again.');
                }
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Announcements', href: '/admin/announcements' },
        { title: 'Edit Announcement', href: `/admin/announcements/${announcement.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Announcement" />
            <div className="m-4 border rounded-lg p-4">
                {/* Display errors */}
                {Object.keys(errors).length > 0 && (
                    <div className="mb-4 p-4 border border-red-600 bg-red-100 text-red-700 rounded">
                        <OctagonAlert className="inline-block mr-2" size={24} />
                        <ul className="list-disc pl-5">
                            {Object.entries(errors).map(([field, message]) => (
                                <li key={field} className="text-sm">{message}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Megaphone size={24} />
                        Edit Announcement
                    </h1>

                    {/* Title */}
                    <div className="w-auto p-4 border rounded-lg mb-2">
                        <Label className="mb-2 block font-medium text-gray-700">
                            Announcement Title
                        </Label>
                        <Input
                            type="text"
                            className="w-full"
                            placeholder="Enter announcement title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                        />
                    </div>

                    {/* Category + Author */}
                    <div className="w-auto mb-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                            <Label className="block font-medium text-gray-700">Category</Label>
                            <Select
                                value={data.category_id}
                                onValueChange={(value) => setData('category_id', value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.length > 0 ? (
                                        categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="0" disabled>No categories available</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="border rounded-lg p-4">
                            <Label className="block font-medium text-gray-700">Author</Label>
                            <Input
                                type="text"
                                className="w-full mt-2"
                                placeholder="Enter author name"
                                value={data.author}
                                onChange={(e) => setData('author', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="w-auto mb-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                            <Label className="block font-medium text-gray-700">Date</Label>
                            <Input
                                type="date"
                                className="w-full mt-2"
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                            />
                        </div>
                        <div className="border rounded-lg p-4">
                            <Label className="block font-medium text-gray-700">End Date</Label>
                            <Input
                                type="date"
                                className="w-full mt-2"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="w-auto p-4 border rounded-lg mb-2">
                        <Label className="mb-2 block font-medium text-gray-700">Summary</Label>
                        <Textarea
                            className="w-full"
                            placeholder="Enter summary"
                            value={data.summary}
                            onChange={(e) => setData('summary', e.target.value)}
                        />
                    </div>

                    {/* Content */}
                    <div className="w-auto p-4 border rounded-lg mb-2">
                        <Label className="mb-2 block font-medium text-gray-700">Content</Label>
                        <Textarea
                            className="w-full"
                            placeholder="Enter content"
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="w-auto p-4 border rounded-lg mb-2">
                        <Label className="mb-2 block font-medium text-gray-700">Upload Image</Label>
                        {preview && (
                            <img
                                src={preview}
                                alt="Preview"
                                className="mt-2 mb-4 rounded-lg border max-h-64"
                            />
                        )}
                        <Input type="file" accept="image/*" onChange={handleImageChange} />
                    </div>

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Update Announcement'}
                    </Button>

                    <Button 
                        type="button"
                        className="ml-2 bg-[var(--Fsecondary)] text-[var(--popover)] shadow-xs hover:bg-[var(--Fsecondary)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--red)] focus:ring-offset-2 disabled:opacity-50"  
                        disabled={processing} 
                        onClick={() => {
                            smartToast.info('Edit cancelled');
                            router.visit(route('announcements.index'));
                        }}
                    >
                        Cancel
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
