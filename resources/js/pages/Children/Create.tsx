import React, { useState, useEffect } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import { SharedData } from "@/types";
import { formatPhoneNumber } from "@/lib/phoneUtils";

export default function ChildrenIndex() {
    const { auth } = usePage<SharedData>().props;
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<{
        name: string;
        sex: string;
        age: string;
        weight: string;
        height: string;
        barangay: string;
        contact_number: string;
    }>({
        name: "",
        sex: "Male",
        age: "",
        weight: "",
        height: "",
        barangay: String(auth.user.barangay || ""),
        contact_number: "",
    });

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setData("contact_number", formatted);
    };

    useEffect(() => {
        // Automatically open modal
        setShowModal(true);
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (Number(data.weight) > 200) {
            alert("Weight cannot exceed 200 kg");
            return;
        }
        if (Number(data.height) > 250) {
            alert("Height cannot exceed 250 cm");
            return;
        }

        post("/children", {
            onSuccess: () => {
                reset();
                router.visit("/children"); // Redirect after saving
            },
        });
    };

    const handleClose = () => {
        router.visit("/children"); // Redirect to children records
    };

    return (
        <AppLayout>
            <Head title="Children Records" />

            {/* Children Table (Visible in background) */}
            <div
                className={`transition-all duration-300 ${
                    showModal ? "blur-sm brightness-95" : ""
                }`}
            >
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-semibold text-gray-800">Children Records</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                        + Add Child
                    </button>
                </div>

                {/* Sample table */}
                <table className="w-full border-collapse bg-white rounded-lg shadow">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="p-3 border">Name</th>
                            <th className="p-3 border">Sex</th>
                            <th className="p-3 border">Age</th>
                            <th className="p-3 border">Weight</th>
                            <th className="p-3 border">Height</th>
                            <th className="p-3 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="hover:bg-gray-50">
                            <td className="p-3 border">Juan Dela Cruz</td>
                            <td className="p-3 border">Male</td>
                            <td className="p-3 border">5</td>
                            <td className="p-3 border">20 kg</td>
                            <td className="p-3 border">110 cm</td>
                            <td className="p-3 border text-center space-x-2">
                                <button className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600">
                                    Edit
                                </button>
                                <button className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Modal Section */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-transparent animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 border border-gray-100 relative animate-fadeInUp">
                        <div className="flex items-center justify-between mb-4 border-b pb-2">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Register New Child
                            </h2>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 text-2xl font-semibold leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-2.5"
                                    placeholder="Enter child's full name"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Sex */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sex
                                </label>
                                <select
                                    value={data.sex}
                                    onChange={(e) => setData("sex", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-2.5"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            {/* Age and Barangay */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        value={data.age}
                                        onChange={(e) => setData("age", e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-2.5"
                                        placeholder="e.g. 5"
                                    />
                                    {errors.age && (
                                        <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Barangay
                                    </label>
                                    <input
                                        type="text"
                                        value={data.barangay}
                                        readOnly
                                        className="w-full rounded-lg border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed p-2.5"
                                    />
                                </div>
                            </div>

                            {/* Weight and Height */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Weight (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={data.weight}
                                        onChange={(e) => setData("weight", e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-2.5"
                                        placeholder="e.g. 45"
                                    />
                                    {errors.weight && (
                                        <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Height (cm)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={data.height}
                                        onChange={(e) => setData("height", e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-2.5"
                                        placeholder="e.g. 150"
                                    />
                                    {errors.height && (
                                        <p className="text-red-500 text-sm mt-1">{errors.height}</p>
                                    )}
                                </div>
                            </div>

                            {/* Contact Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Guardian Contact Number
                                </label>
                                <input
                                    type="text"
                                    value={data.contact_number}
                                    onChange={handlePhoneNumberChange}
                                    className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-2.5"
                                    placeholder="+63 XXX XXX XXXX"
                                />
                                {errors.contact_number && (
                                    <p className="text-red-500 text-sm mt-1">{errors.contact_number}</p>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                                >
                                    {processing ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
