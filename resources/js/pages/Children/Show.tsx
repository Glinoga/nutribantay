import AppLayout from '@/layouts/app-layout';
import { Inertia } from '@inertiajs/inertia';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Baby, Calendar, Edit2, Heart, MapPin, MessageSquare, Phone, Ruler, Scale, Stethoscope, User, X } from 'lucide-react';
import smartToast from '@/utils/smartToast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Textarea } from '@/components/ui/textarea';

type Note = {
    id: number;
    note: string;
    created_at: string;
    author?: { name: string | null };
};

type Child = {
    id: number;
    fullname: string;
    first_name: string;
    middle_initial?: string | null;
    last_name: string;
    sex: string;
    age: number | null;
    weight: number | null;
    height: number | null;
    barangay: string | null;
    address: string | null;
    contact_number: string | null;
    creator?: { name: string | null };
    updater?: { name: string | null };
    created_at: string;
    updated_at: string;
    notes?: Note[];
};

export default function Show({ child }: { child: Child }) {
    const [notesOpen, setNotesOpen] = useState(false);
    const [newNote, setNewNote] = useState('');

    const calculateBMI = () => {
        if (!child.weight || !child.height || child.height <= 0) return null;
        return (child.weight / Math.pow(child.height / 100, 2)).toFixed(1);
    };

    const bmi = calculateBMI();

    const getBMIStatus = (bmiValue: number) => {
        if (bmiValue < 18.5) return { text: 'Underweight', color: 'text-orange-600 bg-orange-50', icon: '⚠️' };
        if (bmiValue < 25) return { text: 'Normal', color: 'text-green-600 bg-green-50', icon: '✓' };
        if (bmiValue < 30) return { text: 'Overweight', color: 'text-yellow-600 bg-yellow-50', icon: '⚠️' };
        return { text: 'Obese', color: 'text-red-600 bg-red-50', icon: '⚠️' };
    };

    const bmiStatus = bmi ? getBMIStatus(parseFloat(bmi)) : null;

    const submitNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) {
            smartToast.error('Please enter a note');
            return;
        }
        Inertia.post(`/children/${child.id}/notes`, { note: newNote }, {
            onSuccess: () => {
                smartToast.success('Note added successfully');
                setNewNote('');
            },
            onError: () => {
                smartToast.error('Failed to add note');
            },
        });
    };

    const deleteNote = (noteId: number) => {
        Inertia.delete(`/children/${child.id}/notes/${noteId}`, {
            onSuccess: () => smartToast.success('Note deleted'),
            onError: () => smartToast.error('Failed to delete note'),
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Children', href: '/children' },
                { title: child.fullname, href: `/children/${child.id}` },
            ]}
        >
            <Head title={`${child.fullname} - Child Profile`} />

            <div className="p-6 max-w-5xl mx-auto space-y-6">
                {/* Header Card */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 via-white to-cyan-50 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(8,145,178,0.08),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(34,211,238,0.08),transparent_50%)]" />
                    <div className="relative p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                    <Baby className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{child.fullname}</h1>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            {child.sex === 'Male' ? '👦' : '👧'} {child.sex}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {child.age ?? 'N/A'} months
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {child.barangay ?? 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-teal-200 hover:bg-teal-50"
                                    onClick={() => router.visit(`/children/${child.id}/edit`)}
                                >
                                    <Edit2 className="w-4 h-4 mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-teal-200 hover:bg-teal-50"
                                    onClick={() => setNotesOpen(true)}
                                >
                                    <MessageSquare className="w-4 h-4 mr-1" />
                                    Notes ({child.notes?.length || 0})
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Weight */}
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Weight</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {child.weight ?? '-'}
                                        <span className="text-sm font-normal text-gray-500 ml-1">kg</span>
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Scale className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Height */}
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Height</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {child.height ?? '-'}
                                        <span className="text-sm font-normal text-gray-500 ml-1">cm</span>
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Ruler className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* BMI */}
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">BMI</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {bmi ?? '-'}
                                    </p>
                                    {bmiStatus && (
                                        <p className={`text-xs font-medium px-2 py-0.5 rounded mt-1 ${bmiStatus.color}`}>
                                            {bmiStatus.icon} {bmiStatus.text}
                                        </p>
                                    )}
                                </div>
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Age */}
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Age</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {child.age ?? '-'}
                                        <span className="text-sm font-normal text-gray-500 ml-1">months</span>
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Contact & Location */}
                    <Card className="border-0 shadow-md">
                        <CardHeader className="bg-gradient-to-r from-teal-50 to-transparent pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="w-5 h-5 text-teal-600" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Contact Number</p>
                                    <p className="text-gray-900">{child.contact_number ?? 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Address</p>
                                    <p className="text-gray-900">{child.address ?? 'Not provided'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Record Info */}
                    <Card className="border-0 shadow-md">
                        <CardHeader className="bg-gradient-to-r from-teal-50 to-transparent pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Stethoscope className="w-5 h-5 text-teal-600" />
                                Record Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Created By</p>
                                    <p className="text-gray-900">{child.creator?.name ?? 'System'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                                    <p className="text-gray-900">
                                        {new Date(child.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t relative z-10">
                    <button
                        type="button"
                        onClick={() => router.visit('/children')}
                        className="text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors cursor-pointer bg-transparent border-none"
                    >
                        <X className="w-4 h-4" />
                        Back to List
                    </button>
                    <div className="flex gap-3">
                        <button 
                            type="button"
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-teal-200 hover:bg-teal-50 h-9 px-4 py-2 relative z-10"
                            onClick={() => router.visit(`/healthlogs?child=${child.id}`)}
                        >
                            <Heart className="w-4 h-4" />
                            View Health Logs
                        </button>
                        <button 
                            type="button"
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white h-9 px-4 py-2 relative z-10"
                            onClick={() => router.visit(`/children/${child.id}/edit`)}
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            {notesOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-lg max-h-[80vh] overflow-hidden rounded-xl bg-white shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between border-b p-4">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-teal-600" />
                            <h2 className="text-lg font-semibold">Notes for {child.first_name}</h2>
                        </div>
                        <button onClick={() => setNotesOpen(false)} className="rounded-full p-1 hover:bg-gray-100">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={submitNote} className="p-4 border-b">
                        <Textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Add a new note about this child..."
                            className="min-h-[100px]"
                        />
                        <button type="submit" className="w-full mt-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2 px-4 rounded-md">
                            Add Note
                        </button>
                    </form>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {child.notes?.length ? (
                            child.notes.map((note) => (
                                <div
                                    key={note.id}
                                    className="p-3 rounded-lg bg-gray-50 border border-gray-100 group"
                                >
                                    <p className="text-gray-900 text-sm">{note.note}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <small className="text-gray-500 text-xs">
                                            {note.author?.name ?? 'Unknown'} •{' '}
                                            {new Date(note.created_at).toLocaleDateString()}
                                        </small>
                                        <button
                                            onClick={() => deleteNote(note.id)}
                                            className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>No notes yet for this child.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
        </AppLayout>
    );
}