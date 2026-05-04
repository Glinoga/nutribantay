import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import { smartToast } from '@/utils/smartToast';
import { Head, router, useForm } from '@inertiajs/react';
import { Loader2, Megaphone, OctagonAlert, X } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    image_url?: string | null;
}

interface EditProps {
    announcement: Announcement;
    categories: Category[];
}

export default function Edit({ announcement, categories }: EditProps) {
    const { data, setData, processing, errors } = useForm({
        title: announcement.title || '',
        date: announcement.date || '',
        end_date: announcement.end_date || '',
        category_id: announcement.category_id ? announcement.category_id.toString() : '',
        author: announcement.author || '',
        summary: announcement.summary || '',
        content: announcement.content || '',
        image: null as File | null,
    });

    const [preview, setPreview] = useState<string | null>(
        announcement.image_url ?? (announcement.image ? `/storage/${announcement.image}` : null)
    );
    const [isDirty, setIsDirty] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        const hasChanges =
            data.title !== (announcement.title || '') ||
            data.date !== (announcement.date || '') ||
            data.end_date !== (announcement.end_date || '') ||
            data.category_id !== (announcement.category_id ? announcement.category_id.toString() : '') ||
            data.author !== (announcement.author || '') ||
            data.summary !== (announcement.summary || '') ||
            data.content !== (announcement.content || '') ||
            data.image !== null;

        setIsDirty(hasChanges);
    }, [data, announcement]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('image', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeExistingImage = () => {
        if (!confirm('Remove existing image? This will delete the image when you save.')) {
            return;
        }
        setPreview(null);
        setData('image', null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const loadingToast = smartToast.loading('Updating announcement...');

        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('date', data.date);
        formData.append('end_date', data.end_date || '');
        formData.append('category_id', data.category_id);
        formData.append('author', data.author || '');
        formData.append('summary', data.summary);
        formData.append('content', data.content);

        if (data.image) {
            formData.append('image', data.image);
        }

        formData.append('_method', 'PUT');

        router.post(route('announcements.update', { announcement: announcement.id }), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                smartToast.dismiss(loadingToast);
                smartToast.success('Announcement updated successfully!');
                setIsDirty(false);
            },
            onError: (errors) => {
                smartToast.dismiss(loadingToast);
                const errorMessages = Object.values(errors).flat();
                if (errorMessages.length > 0) {
                    errorMessages.forEach((error) => {
                        smartToast.error(error as string);
                    });
                } else {
                    smartToast.error('Failed to update announcement. Please try again.');
                }
            },
        });
    };

    const handleCancel = () => {
        if (isDirty) {
            setShowCancelConfirm(true);
        } else {
            router.visit(route('announcements.index'));
        }
    };

    const confirmCancel = () => {
        setShowCancelConfirm(false);
        router.visit(route('announcements.index'));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Announcements', href: '/admin/announcements' },
        { title: 'Edit Announcement', href: `/admin/announcements/${announcement.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Announcement" />

            <div className="m-4 rounded-lg border p-4">
                {/* Display errors */}
                {Object.keys(errors).length > 0 && (
                    <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20">
                        <div className="mb-2 flex items-center gap-2 font-semibold">
                            <OctagonAlert className="inline-block h-5 w-5" />
                            Please fix the following errors:
                        </div>
                        <ul className="list-disc pl-5">
                            {Object.entries(errors).map(([field, message]) => (
                                <li key={field} className="text-sm">
                                    {message}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold">
                        <Megaphone size={24} className="text-blue-600" />
                        Edit Announcement
                    </h1>

                    {/* Title */}
                    <div className="mb-4 rounded-lg border p-4">
                        <Label className="mb-2 block font-medium text-gray-700">
                            Announcement Title <span className="text-red-500">*</span>
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
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-lg border p-4">
                            <Label className="mb-2 block font-medium text-gray-700">
                                Category <span className="text-red-500">*</span>
                            </Label>
                            <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
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
                                        <SelectItem value="0" disabled>
                                            No categories available
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="rounded-lg border p-4">
                            <Label className="mb-2 block font-medium text-gray-700">Author</Label>
                            <Input
                                type="text"
                                className="mt-2 w-full"
                                placeholder="Enter author name"
                                value={data.author}
                                onChange={(e) => setData('author', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-lg border p-4">
                            <Label className="mb-2 block font-medium text-gray-700">
                                Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                className="mt-2 w-full"
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                            />
                        </div>
                        <div className="rounded-lg border p-4">
                            <Label className="mb-2 block font-medium text-gray-700">End Date</Label>
                            <Input
                                type="date"
                                className="mt-2 w-full"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                                min={data.date || undefined}
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="mb-4 rounded-lg border p-4">
                        <Label className="mb-2 block font-medium text-gray-700">
                            Summary <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            className="w-full"
                            placeholder="Enter summary"
                            value={data.summary}
                            onChange={(e) => setData('summary', e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Content */}
                    <div className="mb-4 rounded-lg border p-4">
                        <Label className="mb-2 block font-medium text-gray-700">
                            Content <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            className="w-full"
                            placeholder="Enter content"
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            rows={6}
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="mb-4 rounded-lg border p-4">
                        <Label className="mb-2 block font-medium text-gray-700">Upload Image</Label>
                        {preview && (
                            <div className="relative mb-4 inline-block">
                                <img src={preview} alt="Preview" className="max-h-64 rounded-lg border" />
                                <button
                                    type="button"
                                    onClick={removeExistingImage}
                                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                        <Input type="file" accept="image/*" onChange={handleImageChange} />
                        {preview && data.image === null && (
                            <p className="mt-2 text-xs text-gray-500">Upload a new image to replace the existing one</p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing} className="gap-2">
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Update Announcement'
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={processing}
                            className="gap-2"
                        >
                            <X size={16} />
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                        <h3 className="mb-2 text-lg font-semibold">Discard Changes?</h3>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                            You have unsaved changes. Are you sure you want to discard them?
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
                                Continue Editing
                            </Button>
                            <Button variant="destructive" onClick={confirmCancel}>
                                Discard Changes
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
