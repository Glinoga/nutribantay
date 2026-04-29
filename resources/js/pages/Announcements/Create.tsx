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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

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

          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                <Megaphone size={24} />
                Create an Announcement
              </DialogTitle>
            </DialogHeader>

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
              {/* Title */}
              <div className="w-auto p-4 border rounded-lg mb-2">
                <Label className="mb-2 block font-medium text-gray-700">
                  Announcement Title
                </Label>
                <Input
                  type="text"
                  placeholder="Enter announcement title"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                />
              </div>

              {/* Category & Author */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div className="border rounded-lg p-4">
                  <Label className="block font-medium text-gray-700">Category</Label>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)] mb-2">
                    Select the category for this announcement
                  </p>
                  <Select
                    value={data.category_id.toString()}
                    onValueChange={(value) => setData('category_id', value)}
                  >
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

                <div className="border rounded-lg p-4">
                  <Label className="block font-medium text-gray-700">Author</Label>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)] mb-2">
                    Who is publishing this announcement
                  </p>
                  <Input
                    type="text"
                    placeholder="Enter author name"
                    value={data.author}
                    onChange={(e) => setData('author', e.target.value)}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
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
                  placeholder="Enter summary"
                  value={data.summary}
                  onChange={(e) => setData('summary', e.target.value)}
                />
              </div>

              {/* Content */}
              <div className="w-auto p-4 border rounded-lg mb-2">
                <Label className="mb-2 block font-medium text-gray-700">Content</Label>
                <Textarea
                  placeholder="Enter content"
                  value={data.content}
                  onChange={(e) => setData('content', e.target.value)}
                />
              </div>

              {/* Image Upload */}
              <div className="w-auto p-4 border rounded-lg mb-2">
                <Label className="mb-2 block font-medium text-gray-700">Upload Image</Label>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mt-4 rounded-lg border max-h-64"
                  />
                )}
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
