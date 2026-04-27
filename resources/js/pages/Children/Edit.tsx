import React, { useState, useMemo } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, useForm, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Baby,
  Calendar,
  MapPin,
  MessageSquare,
  Phone,
  Ruler,
  Scale,
  User,
  X,
  CheckCircle2,
} from "lucide-react";
import { smartToast } from "@/utils/smartToast";
import { formatPhoneNumber, displayPhoneNumber } from "@/lib/phoneUtils";

interface Child {
  id: number;
  fullname: string;
  first_name: string;
  middle_initial?: string;
  last_name: string;
  sex: string;
  age: number | null;
  birthdate?: string | null;
  weight?: number | null;
  height?: number | null;
  address?: string;
  contact_number?: string;
  barangay?: string;
}

interface Props {
  child: Child;
}

export default function Edit({ child }: Props) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const getBirthdateValue = () => {
    if (!child.birthdate) return "";
    const date = new Date(child.birthdate);
    return date.toISOString().split("T")[0];
  };

  const { data, setData, put, processing, errors } = useForm({
    first_name: child.first_name || "",
    middle_initial: child.middle_initial || "",
    last_name: child.last_name || "",
    sex: child.sex || "Male",
    birthdate: getBirthdateValue(),
    weight: String(child.weight ?? ""),
    height: String(child.height ?? ""),
    address: child.address || "",
    contact_number: child.contact_number || "",
    barangay: child.barangay ?? "",
  });

  const calculatedAge = useMemo(() => {
    if (!data.birthdate) return child.age;
    const today = new Date();
    const birth = new Date(data.birthdate);
    const diffMs = today.getTime() - birth.getTime();
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
    if (diffMonths < 0) return null;
    return diffMonths;
  }, [data.birthdate]);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setData("contact_number", formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.birthdate) {
      smartToast.error("Please select the child's birthdate");
      return;
    }

    if (calculatedAge === null) {
      smartToast.error("Birthdate cannot be in the future");
      return;
    }

    if (Number(data.weight) > 200) {
      smartToast.error("Weight cannot exceed 200 kg");
      return;
    }
    if (Number(data.height) > 250) {
      smartToast.error("Height cannot exceed 250 cm");
      return;
    }

    put(`/children/${child.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        smartToast.success("Child record updated successfully!");
        router.visit("/children");
      },
      onError: () => {
        smartToast.error("Failed to update record. Please try again.");
      },
    });
  };

  const bmi = data.weight && data.height
    ? (Number(data.weight) / Math.pow(Number(data.height) / 100, 2)).toFixed(1)
    : null;

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: "Underweight", color: "text-orange-600 bg-orange-50" };
    if (bmi < 25) return { text: "Normal", color: "text-green-600 bg-green-50" };
    if (bmi < 30) return { text: "Overweight", color: "text-yellow-600 bg-yellow-50" };
    return { text: "Obese", color: "text-red-600 bg-red-50" };
  };

  const bmiStatus = bmi ? getBMIStatus(Number(bmi)) : null;

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Children", href: "/children" },
        { title: child.fullname, href: `/children/${child.id}` },
        { title: "Edit", href: `/children/${child.id}/edit` },
      ]}
    >
      <Head title={`Edit ${child.fullname}`} />

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .form-section {
          animation: slideUp 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 via-white to-cyan-50 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(8,145,178,0.08),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(34,211,238,0.08),transparent_50%)]" />
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Baby className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit Child Record</h1>
                  <p className="text-sm text-gray-600 mt-1">{child.fullname}</p>
                </div>
              </div>
              <Link href={`/children/${child.id}`}>
                <Button variant="ghost" size="sm">
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {Object.keys(errors).length > 0 && (
          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Please fix the following errors:</p>
                  <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field}>{message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-0 shadow-md form-section" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="bg-gradient-to-r from-teal-50 to-transparent pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    type="text"
                    value={data.first_name}
                    onChange={(e) => setData("first_name", e.target.value)}
                    className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middle_initial" className="text-gray-700">
                    M.I.
                  </Label>
                  <Input
                    id="middle_initial"
                    type="text"
                    maxLength={2}
                    value={data.middle_initial}
                    onChange={(e) =>
                      setData("middle_initial", e.target.value.toUpperCase())
                    }
                    className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    type="text"
                    value={data.last_name}
                    onChange={(e) => setData("last_name", e.target.value)}
                    className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sex" className="text-gray-700">
                    Gender <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={data.sex}
                    onValueChange={(value) => setData("sex", value)}
                  >
                    <SelectTrigger
                      id="sex"
                      className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthdate" className="text-gray-700">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Birthdate <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={data.birthdate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setData("birthdate", e.target.value)}
                    className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                  {calculatedAge !== null && (
                    <p className="text-sm text-teal-600 font-medium">
                      Age: {calculatedAge} months old
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barangay" className="text-gray-700">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Barangay
                  </Label>
                  <Input
                    id="barangay"
                    type="text"
                    value={data.barangay}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed border-gray-200"
                  />
                </div>
              </div>

              {calculatedAge === null && data.birthdate && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  Birthdate cannot be in the future
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md form-section" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="bg-gradient-to-r from-teal-50 to-transparent pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Scale className="w-5 h-5 text-teal-600" />
                Health Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-gray-700">
                    <Scale className="inline h-4 w-4 mr-1" />
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={data.weight}
                    onChange={(e) => setData("weight", e.target.value)}
                    className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height" className="text-gray-700">
                    <Ruler className="inline h-4 w-4 mr-1" />
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={data.height}
                    onChange={(e) => setData("height", e.target.value)}
                    className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center justify-center">
                  {bmi && bmiStatus && (
                    <div className={`w-full rounded-xl border p-4 ${bmiStatus.color}`}>
                      <p className="text-sm font-medium text-gray-600">BMI</p>
                      <p className="text-2xl font-bold">{bmi}</p>
                      <p className="text-sm font-medium">{bmiStatus.text}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md form-section" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="bg-gradient-to-r from-teal-50 to-transparent pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5 text-teal-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_number" className="text-gray-700">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Guardian Contact
                  </Label>
                  <Input
                    id="contact_number"
                    type="tel"
                    value={displayPhoneNumber(data.contact_number)}
                    onChange={handlePhoneNumberChange}
                    className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-gray-700">
                    Address
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    value={data.address}
                    onChange={(e) => setData("address", e.target.value)}
                    className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4 border-t relative z-10">
            <button
              type="button"
              onClick={() => router.visit(`/children/${child.id}`)}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <Button
              type="submit"
              disabled={processing || calculatedAge === null}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {processing ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}