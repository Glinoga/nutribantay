import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OctagonAlert } from "lucide-react";

export default function Edit({ child }: { child: any }) {
  const { data, setData, put, processing, errors } = useForm({
    first_name: child.first_name || '',
    middle_initial: child.middle_initial || '',
    last_name: child.last_name || '',
    sex: child.sex || 'Male',
    birthdate: child.birthdate || '',
    age: String(child.age ?? ''),
    weight: String(child.weight ?? ''),
    height: String(child.height ?? ''),
    barangay: child.barangay || '',
    address: child.address || '',
    contact_number: child.contact_number || '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/children/${child.id}`);
  };

  return (
    <AppLayout>
      <Head title="Edit Child" />

      <h1 className="mb-4 text-xl font-bold">Edit Child</h1>

      <button
        onClick={() => window.history.back()}
        className="mb-4 rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
      >
        Back
      </button>

      <form onSubmit={submit} className="max-w-md space-y-4">

        {/* FIRST NAME */}
        <div>
          <label className="block font-medium">First Name</label>
          <input
            type="text"
            value={data.first_name}
            onChange={(e) => setData('first_name', e.target.value)}
            className="w-full rounded border p-2"
          />
          {errors.first_name && <div className="text-red-600">{errors.first_name}</div>}
        </div>

        {/* MIDDLE INITIAL */}
        <div>
          <label className="block font-medium">Middle Initial</label>
          <input
            type="text"
            maxLength={2}
            value={data.middle_initial}
            onChange={(e) =>
              setData('middle_initial', e.target.value.toUpperCase())
            }
            className="w-full rounded border p-2"
          />
          {errors.middle_initial && <div className="text-red-600">{errors.middle_initial}</div>}
        </div>

        {/* LAST NAME */}
        <div>
          <label className="block font-medium">Last Name</label>
          <input
            type="text"
            value={data.last_name}
            onChange={(e) => setData('last_name', e.target.value)}
            className="w-full rounded border p-2"
          />
          {errors.last_name && <div className="text-red-600">{errors.last_name}</div>}
        </div>

        {/* SEX */}
        <div>
          <label className="block font-medium">Sex</label>
          <select
            value={data.sex}
            onChange={(e) => setData('sex', e.target.value)}
            className="w-full rounded border p-2"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.sex && <div className="text-red-600">{errors.sex}</div>}
        </div>

        {/* BIRTHDATE */}
        <div>
          <label className="block font-medium">Birthdate</label>
          <input
            type="date"
            value={data.birthdate}
            onChange={(e) => setData('birthdate', e.target.value)}
            className="w-full rounded border p-2"
          />
          {errors.birthdate && <div className="text-red-600">{errors.birthdate}</div>}
        </div>

        {/* AGE */}
        <div>
          <label className="block font-medium">Age (months)</label>
          <input
            type="number"
            value={data.age}
            onChange={(e) => setData('age', e.target.value)}
            className="w-full rounded border p-2"
          />
          {errors.age && <div className="text-red-600">{errors.age}</div>}
        </div>

        {/* WEIGHT */}
        <div>
          <label className="block font-medium">Weight (kg)</label>
          <input
            type="number"
            step="0.01"
            value={data.weight}
            onChange={(e) => setData('weight', e.target.value)}
            className="w-full rounded border p-2"
          />
          {errors.weight && <div className="text-red-600">{errors.weight}</div>}
        </div>

        {/* HEIGHT */}
        <div>
          <label className="block font-medium">Height (cm)</label>
          <input
            type="number"
            step="0.01"
            value={data.height}
            onChange={(e) => setData('height', e.target.value)}
            className="w-full rounded border p-2"
          />
          {errors.height && <div className="text-red-600">{errors.height}</div>}
        </div>

        {/* ADDRESS */}
        <div>
          <label className="block font-medium">Address</label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => setData('address', e.target.value)}
            className="w-full rounded border p-2"
          />
          {errors.address && <div className="text-red-600">{errors.address}</div>}
        </div>

        {/* CONTACT NUMBER */}
        <div>
          <label className="block font-medium">Contact Number</label>
          <input
            type="text"
            value={data.contact_number}
            onChange={(e) => setData('contact_number', e.target.value)}
            className="w-full rounded border p-2"
          />
          {errors.contact_number && <div className="text-red-600">{errors.contact_number}</div>}
        </div>

        {/* BARANGAY - READ ONLY */}
        <div>
          <label className="block font-medium">Barangay</label>
          <input
            type="text"
            value={data.barangay}
            readOnly
            className="w-full rounded border bg-gray-100 p-2"
          />
        </div>

        <button
          type="submit"
          disabled={processing}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          {processing ? 'Updating...' : 'Update'}
        </button>
      </form>
    </AppLayout>
  );
}


interface Child {
  id: number;
  name: string;
  sex: string;
  age: number;
  weight?: number;
  height?: number;
  barangay?: string;
}

interface Props {
  child: Child;
}

export default function Edit({ child }: Props) {
  const [showModal, setShowModal] = useState(true);

  const { data, setData, put, processing, errors } = useForm({
    name: child.name || "",
    sex: child.sex || "Male",
    age: String(child.age || ""),
    weight: String(child.weight ?? ""),
    height: String(child.height ?? ""),
    barangay: child.barangay ?? "",
  });

  const greenPalette = "#355e3b";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (Number(data.weight) > 200) {
      toast.error("Weight cannot exceed 200 kg");
      return;
    }
    if (Number(data.height) > 250) {
      toast.error("Height cannot exceed 250 cm");
      return;
    }

    put(`/children/${child.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("✅ Child record updated successfully!");
        router.visit("/children");
      },
      onError: () => {
        toast.error("❌ Failed to update record. Please try again.");
      },
    });
  };

  const handleClose = () => {
    router.visit("/children");
  };

  return (
    <AppLayout>
      <Head title="Edit Child Record" />
      <Toaster position="top-right" reverseOrder={false} />

      <Dialog
        open={showModal}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleClose();
          setShowModal(isOpen);
        }}
      >
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto border-2 rounded-xl bg-green-50 shadow-lg"
          style={{
            borderColor: greenPalette,
            boxShadow: `0 0 25px ${greenPalette}55`,
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="text-center w-full text-3xl font-extrabold mb-6"
              style={{ color: greenPalette }}
            >
              Edit Child Record
            </DialogTitle>
          </DialogHeader>

          
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

          <form onSubmit={handleSubmit} className="space-y-4">
        
            <div
              className="p-4 border rounded-lg bg-green-50"
              style={{ borderColor: greenPalette }}
            >
              <Label className="block font-bold text-gray-800 text-sm mb-2">
                Full Name
              </Label>
              <Input
                type="text"
                placeholder="Enter child's full name"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                className="bg-green-50 border text-gray-800 text-sm font-bold rounded-lg"
                style={{ borderColor: greenPalette }}
              />
            </div>

          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="border rounded-lg p-4 bg-green-50"
                style={{ borderColor: greenPalette }}
              >
                <Label className="block font-bold text-gray-800 text-sm mb-2">
                  Sex
                </Label>
                <Select
                  value={data.sex}
                  onValueChange={(value) => setData("sex", value)}
                >
                  <SelectTrigger
                    className="w-full text-sm font-bold bg-green-50 rounded-lg"
                    style={{ borderColor: greenPalette }}
                  >
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male" className="font-bold">
                      Male
                    </SelectItem>
                    <SelectItem value="Female" className="font-bold">
                      Female
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div
                className="border rounded-lg p-4 bg-green-50"
                style={{ borderColor: greenPalette }}
              >
                <Label className="block font-bold text-gray-800 text-sm mb-2">
                  Barangay
                </Label>
                <Input
                  type="text"
                  value={data.barangay}
                  readOnly
                  className="w-full bg-gray-100 text-gray-600 cursor-not-allowed rounded-lg text-sm font-bold"
                  style={{ borderColor: greenPalette }}
                />
              </div>
            </div>

            <div
              className="p-4 border rounded-lg bg-green-50"
              style={{ borderColor: greenPalette }}
            >
              <Label className="block font-bold text-gray-800 text-sm mb-2">
                Age
              </Label>
              <Input
                type="number"
                placeholder="Enter age"
                value={data.age}
                onChange={(e) => setData("age", e.target.value)}
                className="bg-green-50 border text-gray-800 text-sm font-bold rounded-lg"
                style={{ borderColor: greenPalette }}
              />
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="border rounded-lg p-4 bg-green-50"
                style={{ borderColor: greenPalette }}
              >
                <Label className="block font-bold text-gray-800 text-sm mb-2">
                  Weight (kg)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Enter weight"
                  value={data.weight}
                  onChange={(e) => setData("weight", e.target.value)}
                  className="bg-green-50 border text-gray-800 text-sm font-bold rounded-lg"
                  style={{ borderColor: greenPalette }}
                />
              </div>

              <div
                className="border rounded-lg p-4 bg-green-50"
                style={{ borderColor: greenPalette }}
              >
                <Label className="block font-bold text-gray-800 text-sm mb-2">
                  Height (cm)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Enter height"
                  value={data.height}
                  onChange={(e) => setData("height", e.target.value)}
                  className="bg-green-50 border text-gray-800 text-sm font-bold rounded-lg"
                  style={{ borderColor: greenPalette }}
                />
              </div>
            </div>

           
            <div className="flex justify-center gap-6 pt-6 border-t mt-6">
              <Button
                type="submit"
                disabled={processing}
                className="px-10 py-5 rounded-lg text-white font-bold text-lg shadow-md hover:shadow-lg transition-all"
                style={{
                  backgroundColor: greenPalette,
                  boxShadow: `0 4px 10px ${greenPalette}80`,
                }}
              >
                {processing ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                className="px-10 py-5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-bold text-lg shadow-md hover:shadow-lg transition-all"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
