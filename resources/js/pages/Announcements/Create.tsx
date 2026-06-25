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
import { CheckCircle2, ImagePlus, Megaphone, OctagonAlert, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Announcements', href: route('announcements.index') },
    { title: 'Create Announcement', href: route('announcements.create') },
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
        images: [] as File[],
    });

    const [previews, setPreviews] = useState<string[]>([]);
    const [isDirty, setIsDirty] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const hasChanges =
            data.title !== '' ||
            data.category_id !== '' ||
            data.summary !== '' ||
            data.content !== '' ||
            data.date !== new Date().toISOString().split('T')[0] ||
            data.end_date !== '' ||
            data.author !== '' ||
            data.images.length > 0;

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
                setPreviews([]);
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

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setData('images', [...data.images, ...newFiles]);
            const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
            setPreviews([...previews, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        const updatedFiles = data.images.filter((_, i) => i !== index);
        const updatedPreviews = previews.filter((_, i) => i !== index);
        setData('images', updatedFiles);
        setPreviews(updatedPreviews);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCancel = () => {
        if (isDirty) {
            if (!confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                return;
            }
        }
        reset();
        setPreviews([]);
        window.history.back();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Announcement" />

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .fade-in-up {
                    animation: fadeInUp 0.4s ease-out forwards;
                    opacity: 0;
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.8;
                    }
                }
            `}</style>

            <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(13,148,136,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.12),transparent_50%)]" />

                <div className="relative mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="fade-in-up mb-6 text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-100/50 bg-white/90 px-5 py-2 shadow-lg backdrop-blur-sm dark:border-teal-800/50 dark:bg-gray-800/90">
                            <Megaphone className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                            <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">New Announcement</span>
                        </div>

                        <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-50">
                            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent dark:from-teal-300 dark:via-cyan-300 dark:to-teal-300">
                                Create Announcement
                            </span>
                        </h1>
                        <p className="mx-auto max-w-xl text-gray-600 dark:text-gray-300">Create a new announcement to keep your community informed</p>
                    </div>

                    {Object.keys(errors).length > 0 && (
                        <div className="fade-in-up mb-6 rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-6 shadow-lg dark:border-red-800 dark:from-red-900/20 dark:to-red-900/20">
                            <div className="flex items-start gap-3">
                                <div className="rounded-full bg-red-200 p-2 dark:bg-red-900/30">
                                    <OctagonAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="mb-2 font-bold text-red-800 dark:text-red-400">Please fix the following errors:</h4>
                                    <ul className="list-inside list-disc space-y-1">
                                        {Object.entries(errors).map(([field, message]) => (
                                            <li key={field} className="text-sm text-red-700 dark:text-red-400">
                                                {message}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-5">
                        <div className="fade-in-up rounded-xl border border-teal-100 bg-white p-5 shadow-sm dark:border-teal-800 dark:bg-gray-800">
                            <Label className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-100">
                                Announcement Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="text"
                                placeholder="Enter announcement title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="rounded-md border-teal-200 bg-white text-sm font-medium transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-teal-700 dark:bg-gray-700"
                            />
                        </div>

                        <div className="fade-in-up grid grid-cols-1 gap-5 md:grid-cols-2" style={{ animationDelay: '0.1s' }}>
                            <div className="rounded-xl border border-teal-100 bg-white p-5 shadow-sm dark:border-teal-800 dark:bg-gray-800">
                                <Label className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-100">
                                    Category <span className="text-red-500">*</span>
                                </Label>
                                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Select the category for this announcement</p>
                                <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                    <SelectTrigger className="w-full rounded-md border-teal-200 transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
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

                            <div className="rounded-xl border border-teal-100 bg-white p-5 shadow-sm dark:border-teal-800 dark:bg-gray-800">
                                <Label className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-100">Author</Label>
                                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Who is publishing this announcement</p>
                                <Input
                                    type="text"
                                    placeholder="Enter author name"
                                    value={data.author}
                                    onChange={(e) => setData('author', e.target.value.replace(/[^a-zA-ZñÑ\s'-.]/g, ''))}
                                    className="rounded-md border-teal-200 bg-white text-sm font-medium transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-teal-700 dark:bg-gray-700"
                                />
                            </div>
                        </div>

                        <div className="fade-in-up grid grid-cols-1 gap-5 md:grid-cols-2" style={{ animationDelay: '0.15s' }}>
                            <div className="rounded-xl border border-teal-100 bg-white p-5 shadow-sm dark:border-teal-800 dark:bg-gray-800">
                                <Label className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-100">
                                    Published Date <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="mt-2 rounded-md border-teal-200 bg-white text-sm font-medium transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-teal-700 dark:bg-gray-700"
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Select today to publish immediately, or choose a future date to schedule
                                </p>
                            </div>

                            <div className="rounded-xl border border-teal-100 bg-white p-5 shadow-sm dark:border-teal-800 dark:bg-gray-800">
                                <Label className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-100">End Date</Label>
                                <Input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    min={data.date || new Date().toISOString().split('T')[0]}
                                    className="mt-2 rounded-md border-teal-200 bg-white text-sm font-medium transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-teal-700 dark:bg-gray-700"
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Optional: When the announcement should no longer be shown
                                </p>
                            </div>
                        </div>

                        <div
                            className="fade-in-up rounded-xl border border-teal-100 bg-white p-5 shadow-sm dark:border-teal-800 dark:bg-gray-800"
                            style={{ animationDelay: '0.2s' }}
                        >
                            <Label className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-100">
                                Summary <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                placeholder="Enter a brief summary of the announcement"
                                value={data.summary}
                                onChange={(e) => setData('summary', e.target.value)}
                                rows={3}
                                className="rounded-md border-teal-200 text-sm transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{data.summary.length} characters</p>
                        </div>

                        <div
                            className="fade-in-up rounded-xl border border-teal-100 bg-white p-5 shadow-sm dark:border-teal-800 dark:bg-gray-800"
                            style={{ animationDelay: '0.25s' }}
                        >
                            <Label className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-100">
                                Content <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                placeholder="Enter the full content of the announcement"
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                rows={6}
                                className="rounded-md border-teal-200 text-sm transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{data.content.length} characters</p>
                        </div>

                        <div
                            className="fade-in-up rounded-xl border border-teal-100 bg-white p-5 shadow-sm dark:border-teal-800 dark:bg-gray-800"
                            style={{ animationDelay: '0.3s' }}
                        >
                            <Label className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-100">Upload Images</Label>
                            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Add one or more images for your announcement gallery</p>
                            <div className="mt-2">
                                <label
                                    htmlFor="images-upload"
                                    className="flex cursor-pointer items-center gap-2 rounded-md border-2 border-dashed border-teal-200 bg-teal-50/30 px-4 py-6 text-sm font-medium text-teal-700 transition-colors hover:border-teal-400 hover:bg-teal-50 dark:border-gray-600 dark:bg-gray-800 dark:text-teal-400 dark:hover:border-teal-500 dark:hover:bg-gray-700"
                                >
                                    <ImagePlus className="h-5 w-5" />
                                    <span>Click to select images (JPG, PNG, GIF, max 5MB each)</span>
                                </label>
                                <input
                                    id="images-upload"
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImagesChange}
                                    className="hidden"
                                />
                            </div>
                            {previews.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                    {previews.map((p, index) => (
                                        <div key={index} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-teal-100 shadow-sm dark:border-gray-600">
                                            <img src={p} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 rounded-full bg-red-500/90 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                                            >
                                                <X size={14} />
                                            </button>
                                            <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                                                {index + 1}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                {previews.length} file{previews.length !== 1 ? 's' : ''} selected
                            </p>
                        </div>

                        <div
                            className="fade-in-up flex flex-col gap-4 border-t border-gray-200 pt-8 sm:flex-row sm:justify-center dark:border-gray-600"
                            style={{ animationDelay: '0.35s' }}
                        >
                            <Button
                                type="submit"
                                disabled={processing}
                                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-12 py-6 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {processing ? (
                                        <>
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-5 w-5 transition-transform group-hover:rotate-12" />
                                            Create Announcement
                                        </>
                                    )}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-teal-600 opacity-0 transition-opacity group-hover:opacity-100" />
                            </Button>

                            <Button
                                type="button"
                                onClick={handleCancel}
                                disabled={processing}
                                className="rounded-full border-2 border-gray-300 bg-white px-12 py-6 text-lg font-bold text-gray-700 shadow-md transition-all hover:scale-105 hover:border-gray-400 hover:bg-gray-50 hover:shadow-lg dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </Button>
                        </div>

                        <div
                            className="fade-in-up rounded-xl border-2 border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 p-5 dark:border-teal-800 dark:from-teal-900/20 dark:to-cyan-900/20"
                            style={{ animationDelay: '0.4s' }}
                        >
                            <div className="flex items-start gap-3">
                                <Sparkles className="h-5 w-5 flex-shrink-0 text-teal-600 dark:text-teal-400" />
                                <div>
                                    <p className="font-semibold text-teal-800 dark:text-teal-200">Quick Tips:</p>
                                    <ul className="mt-2 space-y-1 text-sm text-teal-700 dark:text-teal-300">
                                        <li>
                                            • All fields marked with <span className="text-red-500">*</span> are required
                                        </li>
                                        <li>• Set an end date to automatically expire announcements</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
