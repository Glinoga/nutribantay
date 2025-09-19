import axios from 'axios';
import { useEffect, useState } from 'react';

export default function GuestAnnouncements() {
    const [announcements, setAnnouncements] = useState<any[]>([]);

    useEffect(() => {
        axios
            .get('/announcements')
            .then((res) => setAnnouncements(res.data))
            .catch((err) => console.error(err));
    }, []);

    return (
        <div className="mx-auto max-w-3xl p-6">
            <h1 className="mb-6 text-3xl font-bold text-gray-800">📢 Announcements</h1>

            {announcements.length === 0 ? (
                <p className="text-gray-600">No announcements yet.</p>
            ) : (
                <div className="space-y-4">
                    {announcements.map((a) => (
                        <div key={a.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                            <h2 className="text-xl font-semibold text-gray-900">{a.title}</h2>
                            <p className="mt-2 text-gray-700">{a.content}</p>
                            <p className="mt-3 text-sm text-gray-500">Posted on {new Date(a.created_at).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
