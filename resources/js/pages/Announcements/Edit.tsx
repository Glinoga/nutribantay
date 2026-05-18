import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
    slug?: string;
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
    page?: string;
}

export default function Edit({ announcement, categories, page }: EditProps) {
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

    const [preview, setPreview] = useState<string | null>(announcement.image_url ?? (announcement.image ? `/storage/${announcement.image}` : null));
    const [isDirty, setIsDirty] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showModal, setShowModal] = useState(true);

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
        formData.append('page', page || '1');

        router.post(route('announcements.update', { announcement: announcement.slug }), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                smartToast.dismiss(loadingToast);
                smartToast.success('Announcement updated successfully!');
                setIsDirty(false);
                router.visit(route('announcements.index'));
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

    const handleClose = () => {
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
        { title: 'Announcements', href: route('announcements.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Announcement" />

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
            `}</style>

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(13,148,136,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.12),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="fade-in-up mb-6 text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-100/50 bg-white/90 px-5 py-2 shadow-lg backdrop-blur-sm">
                            <Megaphone className="h-5 w-5 text-teal-600" />
                            <span className="text-sm font-semibold text-teal-700">Edit Announcement</span>
                        </div>

                        <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
                            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                                Edit Announcement
                            </span>
                        </h1>
                        <p className="mx-auto max-w-xl text-gray-600">
                            Update details for &ldquo;{announcement.title}&rdquo;
                        </p>
                    </div>

                    <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <Dialog
                            open={showModal}
                            onOpenChange={(isOpen) => {
                                if (!isOpen) handleClose();
                                setShowModal(isOpen);
                            }}
                        >
                            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-xl border-2 border-teal-100 bg-white shadow-lg">
                                <div className="relative -m-6 mb-6 overflow-hidden rounded-t-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 p-6">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.1),transparent_50%)]" />
                                    <div className="relative z-10 text-center">
                                        <h2 className="text-2xl font-bold text-white">Edit Announcement</h2>
                                        <p className="text-teal-100">Update the details below</p>
                                    </div>
                                </div>

                                {Object.keys(errors).length > 0 && (
                                    <div className="mb-4 rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-5 shadow-md">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-full bg-red-200 p-2">
                                                <OctagonAlert className="h-5 w-5 text-red-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="mb-2 font-bold text-red-800">Please fix the following errors:</h4>
                                                <ul className="list-inside list-disc space-y-1">
                                                    {Object.entries(errors).map(([field, message]) => (
                                                        <li key={field} className="text-sm text-red-700">
                                                            {message}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
                                    <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                                        <Label className="mb-2 block text-sm font-bold text-gray-800">
                                            Announcement Title <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            type="text"
                                            placeholder="Enter announcement title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="rounded-md border-teal-200 bg-white text-sm font-medium transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                                            <Label className="mb-2 block text-sm font-bold text-gray-800">
                                                Category <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                                <SelectTrigger className="w-full rounded-md border-teal-200 bg-white text-sm font-medium transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20">
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

                                        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                                            <Label className="mb-2 block text-sm font-bold text-gray-800">Author</Label>
                                            <Input
                                                type="text"
                                                placeholder="Enter author name"
                                                value={data.author}
                                                onChange={(e) => setData('author', e.target.value.replace(/[^a-zA-ZñÑ\s'-.]/g, ''))}
                                                className="rounded-md border-teal-200 bg-white text-sm font-medium transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                                            <Label className="mb-2 block text-sm font-bold text-gray-800">
                                                Date <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="date"
                                                value={data.date}
                                                onChange={(e) => setData('date', e.target.value)}
                                                className="mt-2 rounded-md border-teal-200 bg-white text-sm font-medium transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                            />
                                        </div>

                                        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                                            <Label className="mb-2 block text-sm font-bold text-gray-800">End Date</Label>
                                            <Input
                                                type="date"
                                                value={data.end_date}
                                                onChange={(e) => setData('end_date', e.target.value)}
                                                min={data.date || undefined}
                                                className="mt-2 rounded-md border-teal-200 bg-white text-sm font-medium transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                                        <Label className="mb-2 block text-sm font-bold text-gray-800">
                                            Summary <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            placeholder="Enter summary"
                                            value={data.summary}
                                            onChange={(e) => setData('summary', e.target.value)}
                                            rows={3}
                                            className="rounded-md border-teal-200 text-sm transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                        />
                                    </div>

                                    <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                                        <Label className="mb-2 block text-sm font-bold text-gray-800">
                                            Content <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            placeholder="Enter content"
                                            value={data.content}
                                            onChange={(e) => setData('content', e.target.value)}
                                            rows={6}
                                            className="rounded-md border-teal-200 text-sm transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                                        />
                                    </div>

                                    <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                                        <Label className="mb-2 block text-sm font-bold text-gray-800">Upload Image</Label>
                                        {preview && (
                                            <div className="relative mb-4 inline-block">
                                                <img src={preview} alt="Preview" className="max-h-64 rounded-md border" />
                                                <button
                                                    type="button"
                                                    onClick={removeExistingImage}
                                                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="rounded-md border-teal-200 text-sm transition-colors file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-teal-700 hover:file:bg-teal-100"
                                        />
                                        {preview && data.image === null && (
                                            <p className="mt-2 text-xs text-gray-500">Upload a new image to replace the existing one</p>
                                        )}
                                    </div>

                                            <div className="flex justify-center gap-4 border-t border-gray-100 pt-6">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-md bg-gradient-to-r from-teal-500 to-cyan-500 px-10 py-5 text-lg font-bold text-white shadow-md transition-all hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg disabled:opacity-50"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleClose}
                                            disabled={processing}
                                            variant="outline"
                                            className="rounded-md px-10 py-5 text-lg font-bold text-gray-800 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            {showCancelConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">Discard Changes?</h3>
                        <p className="mb-4 text-sm text-gray-600">
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
