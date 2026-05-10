import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import { smartToast } from '@/utils/smartToast';
import { Head, useForm } from '@inertiajs/react';
import { Loader2, Megaphone, OctagonAlert, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Announcements', href: '/admin/announcements' },
    { title: 'Create Announcement', href: '/admin/announcements/create' },
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
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        date: new Date().toISOString().split('T')[0],
        end_date: '',
        category_id: '',
        author: '',
        summary: '',
        content: '',
        image: null as File | null,
    });

    const [preview, setPreview] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        const hasChanges =
            data.title !== '' ||
            data.category_id !== '' ||
            data.summary !== '' ||
            data.content !== '' ||
            data.date !== new Date().toISOString().split('T')[0] ||
            data.end_date !== '' ||
            data.author !== '' ||
            data.image !== null;

        setIsDirty(hasChanges);
    }, [data]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const loadingToast = smartToast.loading('Creating announcement...');

        post(route('announcements.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                smartToast.dismiss(loadingToast);
                smartToast.success('Announcement created successfully!');
                reset();
                setPreview(null);
            },
            onError: (errors) => {
                smartToast.dismiss(loadingToast);
                const errorMessages = Object.values(errors).flat();
                if (errorMessages.length > 0) {
                    errorMessages.forEach((error) => {
                        smartToast.error(error as string);
                    });
                } else {
                    smartToast.error('Failed to create announcement. Please try again.');
                }
            },
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('image', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setData('image', null);
        setPreview(null);
        const input = document.getElementById('image-upload') as HTMLInputElement;
        if (input) input.value = '';
    };

    const handleCancel = () => {
        if (isDirty) {
            if (!confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                return;
            }
        }
        reset();
        setPreview(null);
        window.history.back();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Announcement" />

            <div className="m-4">
                {/* Display errors */}
                {Object.keys(errors).length > 0 && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
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
                        Create Announcement
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
                            <p className="mb-2 text-xs text-gray-500">Select the category for this announcement</p>
                            <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
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
                            <Label className="mb-2 block font-medium text-gray-700">Author</Label>
                            <p className="mb-2 text-xs text-gray-500">Who is publishing this announcement</p>
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
                                Publication Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                className="mt-2 w-full"
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                            <p className="mt-1 text-xs text-gray-500">Select today to publish immediately, or choose a future date to schedule</p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <Label className="mb-2 block font-medium text-gray-700">End Date</Label>
                            <Input
                                type="date"
                                className="mt-2 w-full"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                                min={data.date || new Date().toISOString().split('T')[0]}
                            />
                            <p className="mt-1 text-xs text-gray-500">Optional: When the announcement should no longer be shown</p>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="mb-4 rounded-lg border p-4">
                        <Label className="mb-2 block font-medium text-gray-700">
                            Summary <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            className="w-full"
                            placeholder="Enter a brief summary of the announcement"
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
                            placeholder="Enter the full content of the announcement"
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            rows={6}
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="mb-4 rounded-lg border p-4">
                        <Label className="mb-2 block font-medium text-gray-700">Upload Image</Label>
                        <Input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />
                        {preview && (
                            <div className="relative mt-4 inline-block">
                                <img src={preview} alt="Preview" className="max-h-64 rounded-lg border" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing} className="gap-2">
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Announcement'
                            )}
                        </Button>

                        <Button type="button" variant="outline" onClick={handleCancel} disabled={processing} className="gap-2">
                            <X size={16} />
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
