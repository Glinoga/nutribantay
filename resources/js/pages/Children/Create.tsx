import React, { useState, useEffect } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import { SharedData } from "@/types";

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
    }>({
        name: "",
        sex: "Male",
        age: "",
        weight: "",
        height: "",
        barangay: String(auth.user.barangay || ""),
    });

    useEffect(() => {
        // Auto-open modal when page loads
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
            <Head title="Add Child Record" />

            {/* Modal Section */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200 bg-opacity-80 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 border border-gray-100 relative animate-fadeIn">
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
