import React, { useState, useMemo } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import { SharedData } from "@/types";
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
import {
  OctagonAlert,
  Baby,
  Phone,
  User,
  Ruler,
  Weight,
  MapPin,
  Sparkles,
  CheckCircle2,
  Calendar,
  X,
} from "lucide-react";
import { smartToast } from "@/utils/smartToast";
import { formatPhoneNumber, displayPhoneNumber } from "@/lib/phoneUtils";

export default function ChildrenCreate() {
  const { auth } = usePage<SharedData>().props;
  const [showModal, setShowModal] = useState(true);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { data, setData, post, processing, errors, reset } = useForm({
    first_name: "",
    middle_initial: "",
    last_name: "",
    sex: "Male",
    birthdate: "",
    weight: "",
    height: "",
    contact_number: "",
    barangay: typeof auth.user?.barangay === "string" ? auth.user.barangay : "",
  });

  const calculatedAge = useMemo(() => {
    if (!data.birthdate) return null;
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

    post("/children", {
      onSuccess: () => {
        smartToast.success("Child successfully registered!");
        reset();
        router.visit("/children");
      },
      onError: () => {
        smartToast.error("Failed to register child. Please check your inputs.");
      },
    });
  };

  const handleClose = () => {
    router.visit("/children");
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
    <AppLayout>
      <Head title="Add Child" />

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .form-field {
          animation: slideUp 0.4s ease-out forwards;
          opacity: 0;
        }
        .form-field:nth-child(1) { animation-delay: 0.1s; }
        .form-field:nth-child(2) { animation-delay: 0.15s; }
        .form-field:nth-child(3) { animation-delay: 0.2s; }
        .form-field:nth-child(4) { animation-delay: 0.25s; }
        .form-field:nth-child(5) { animation-delay: 0.3s; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .bmi-card { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
          <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.1),transparent_50%)]" />
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative z-10 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">
                <Baby className="h-5 w-5 text-white" />
                <span className="text-sm font-semibold text-white">Child Registration</span>
              </div>
              <h1 className="mb-2 text-3xl font-bold text-white">Register New Child</h1>
              <p className="text-teal-100">Add a child to the nutrition tracking system</p>
            </div>
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="mx-6 mt-6 rounded-xl border-2 border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <OctagonAlert className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-800">Please fix the following errors:</h4>
                  <ul className="mt-1 list-inside list-disc text-sm text-red-700">
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field}>{message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="form-field">
                <Label className="mb-2 block text-sm font-semibold text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="First name"
                  value={data.first_name}
                  onChange={(e) => setData("first_name", e.target.value)}
                  className="border border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div className="form-field">
                <Label className="mb-2 block text-sm font-semibold text-gray-700">M.I.</Label>
                <Input
                  type="text"
                  placeholder="M.I."
                  maxLength={2}
                  value={data.middle_initial}
                  onChange={(e) => setData("middle_initial", e.target.value.toUpperCase())}
                  className="border border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div className="form-field">
                <Label className="mb-2 block text-sm font-semibold text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Last name"
                  value={data.last_name}
                  onChange={(e) => setData("last_name", e.target.value)}
                  className="border border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="form-field">
                <Label className="mb-2 block text-sm font-semibold text-gray-700">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Select value={data.sex} onValueChange={(value) => setData("sex", value)}>
                  <SelectTrigger className="border border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="form-field">
                <Label className="mb-2 block text-sm font-semibold text-gray-700">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Birthdate <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={data.birthdate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setData("birthdate", e.target.value)}
                  className="border border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                />
                {calculatedAge !== null && (
                  <p className="mt-1 text-sm text-teal-600 font-medium">
                    Age: {calculatedAge} months old
                  </p>
                )}
              </div>
            </div>

            {calculatedAge === null && data.birthdate && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                Birthdate cannot be in the future
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="form-field">
                <Label className="mb-2 block text-sm font-semibold text-gray-700">
                  <Weight className="inline h-4 w-4 mr-1" />
                  Weight (kg)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={data.weight}
                  onChange={(e) => setData("weight", e.target.value)}
                  min="0"
                  max="200"
                  className="border border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div className="form-field">
                <Label className="mb-2 block text-sm font-semibold text-gray-700">
                  <Ruler className="inline h-4 w-4 mr-1" />
                  Height (cm)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={data.height}
                  onChange={(e) => setData("height", e.target.value)}
                  min="0"
                  max="250"
                  className="border border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            </div>

            {bmi && bmiStatus && (
              <div className={`bmi-card rounded-xl border border-gray-200 p-4 ${bmiStatus.color}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Body Mass Index (BMI)</p>
                    <p className="text-2xl font-bold">{bmi}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className="text-lg font-bold">{bmiStatus.text}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="form-field">
                <Label className="mb-2 block text-sm font-semibold text-gray-700">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Guardian Contact
                </Label>
                <Input
                  type="tel"
                  placeholder="+63 XXX XXX XXXX"
                  value={displayPhoneNumber(data.contact_number)}
                  onChange={handlePhoneNumberChange}
                  className="border border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div className="form-field">
                <Label className="mb-2 block text-sm font-semibold text-gray-700">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Barangay
                </Label>
                <Input
                  type="text"
                  value={data.barangay ?? ""}
                  readOnly
                  className="border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={processing || calculatedAge === null}
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {processing ? "Registering..." : "Register Child"}
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
                className="border-gray-300"
              >
                Cancel
              </Button>
            </div>

            <div className="rounded-xl bg-teal-50 border border-teal-200 p-4">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-teal-800">
                  <p className="font-semibold">Quick Tips:</p>
                  <ul className="mt-1 list-disc list-inside space-y-0.5">
                    <li>Birthdate is required - age is calculated automatically</li>
                    <li>Weight and height are used to calculate BMI</li>
                    <li>Contact number helps us reach guardians for important updates</li>
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