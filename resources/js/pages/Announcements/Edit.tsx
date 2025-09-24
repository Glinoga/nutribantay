import React from "react";
import { useForm } from "@inertiajs/react";
import { route } from "@/lib/routes"; 

interface EditProps {
  announcement: {
    id: number;
    title: string;
    date: string;
    end_date: string | null;
    summary: string;
    content: string;
    image?: string | null;
  };
}

export default function Edit({ announcement }: EditProps) {
  const { data, setData, put, processing, errors } = useForm({
    title: announcement.title || "",
    date: announcement.date || "",
    end_date: announcement.end_date || "",
    summary: announcement.summary || "",
    content: announcement.content || "",
    image: null as File | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route("announcements.update", { announcement: announcement.id }), {
      forceFormData: true, 
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Announcement</h1>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Title */}
        <div className="mb-4">
          <label className="block font-medium">Title</label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => setData("title", e.target.value)}
            className="w-full border rounded p-2"
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="block font-medium">Start Date</label>
          <input
            type="date"
            value={data.date}
            onChange={(e) => setData("date", e.target.value)}
            className="w-full border rounded p-2"
          />
          {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
        </div>

        {/* End Date */}
        <div className="mb-4">
          <label className="block font-medium">End Date</label>
          <input
            type="date"
            value={data.end_date || ""}
            onChange={(e) => setData("end_date", e.target.value)}
            className="w-full border rounded p-2"
          />
          {errors.end_date && <p className="text-red-500 text-sm">{errors.end_date}</p>}
        </div>

        {/* Summary */}
        <div className="mb-4">
          <label className="block font-medium">Summary</label>
          <textarea
            value={data.summary}
            onChange={(e) => setData("summary", e.target.value)}
            className="w-full border rounded p-2"
          />
          {errors.summary && <p className="text-red-500 text-sm">{errors.summary}</p>}
        </div>

        {/* Content */}
        <div className="mb-4">
          <label className="block font-medium">Content</label>
          <textarea
            value={data.content}
            onChange={(e) => setData("content", e.target.value)}
            className="w-full border rounded p-2"
          />
          {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
        </div>

        {/* Current Image */}
        {announcement.image && (
          <div className="mb-4">
            <label className="block font-medium">Current Image</label>
            <img
              src={`/storage/${announcement.image}`}
              alt="Announcement"
              className="w-48 h-auto mt-2 rounded"
            />
          </div>
        )}

        {/* Replace Image */}
        <div className="mb-4">
          <label className="block font-medium">Replace Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setData("image", e.target.files ? e.target.files[0] : null)
            }
            className="w-full"
          />
          {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
        </div>

        <button
          type="submit"
          disabled={processing}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {processing ? "Updating..." : "Update"}
        </button>
      </form>
    </div>
  );
}
