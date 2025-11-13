import React, { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import { SharedData } from "@/types";
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
import {
  OctagonAlert,
  Baby,
  Phone,
  User,
  Ruler,
  Weight,
  Calendar,
  MapPin,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { smartToast } from "@/utils/smartToast";
import { formatPhoneNumber, displayPhoneNumber } from "@/lib/phoneUtils";

export default function ChildrenCreate() {
  const { auth } = usePage<SharedData>().props;
  const [showModal, setShowModal] = useState(true);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    sex: "Male",
    age: "",
    weight: "",
    height: "",
    contact_number: "",
    barangay: typeof auth.user?.barangay === "string" ? auth.user.barangay : "",
  });

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setData("contact_number", formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
        smartToast.success("Child successfully registered! 🎉");
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

  // Calculate BMI if weight and height are provided
  const bmi = data.weight && data.height
    ? (Number(data.weight) / Math.pow(Number(data.height) / 100, 2)).toFixed(1)
    : null;

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: "Underweight", color: "text-orange-600" };
    if (bmi < 25) return { text: "Normal", color: "text-green-600" };
    if (bmi < 30) return { text: "Overweight", color: "text-yellow-600" };
    return { text: "Obese", color: "text-red-600" };
  };

  return (
    <AppLayout>
      <Head title="Add Child" />

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .form-field {
          animation: slideUp 0.5s ease-out;
        }

        .form-field:hover {
          transform: translateY(-2px);
          transition: transform 0.3s ease;
        }

        .input-focus {
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
          border-color: #22c55e !important;
        }

        .success-checkmark {
          animation: bounce 1s ease-in-out;
        }

        /* Custom scrollbar */
        .modal-content::-webkit-scrollbar {
          width: 5px;
        }

        .modal-content::-webkit-scrollbar-track {
          background: linear-gradient(to bottom, rgba(191, 219, 254, 0.3), rgba(233, 213, 255, 0.3));
          border-radius: 10px;
        }

        .modal-content::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgb(34, 197, 94), rgb(16, 185, 129));
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.5);
        }

        .modal-content::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgb(22, 163, 74), rgb(5, 150, 105));
        }
      `}</style>

      <Dialog
        open={showModal}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleClose();
          setShowModal(isOpen);
        }}
      >
        <DialogContent
          className="modal-content max-w-12xl max-h-[90vh] overflow-y-auto border-0 rounded-md shadow-2xl bg-gradient-to-br from-green-50 via-white to-emerald-50"
        >
          {/* Modern Header with Gradient */}
          <div className="relative overflow-hidden rounded-t-md bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 -m-6 mb-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.1),transparent_50%)]" />

            <div className="relative z-10 text-center">
              <div className="mb-4 inline-flex items-center gap-3 rounded-full bg-white/20 px-6 py-3 shadow-lg backdrop-blur-sm">
                <Baby className="h-6 w-6 text-white" />
                <span className="text-sm font-semibold text-white">Child Registration</span>
              </div>

              <h1 className="mb-2 text-4xl font-bold text-white md:text-5xl">
                Register New Child
              </h1>
              <p className="text-emerald-100">
                Add a new child to the nutrition tracking system
              </p>
            </div>
          </div>

          {/* Validation Errors */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6 rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-6 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-red-200 p-2">
                  <OctagonAlert className="h-6 w-6 text-red-600" />
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div
              className="form-field group rounded-2xl border-2 border-green-200 bg-white p-6 shadow-md transition-all hover:shadow-lg"
              style={{ animationDelay: '0ms' }}
            >
              <Label className="mb-3 flex items-center gap-2 text-base font-bold text-gray-800">
                <User className="h-5 w-5 text-green-600" />
                Child's Full Name
                <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Enter child's full name"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                className={`border-2 text-base font-medium transition-all ${focusedField === "name" ? "input-focus" : "border-gray-300"
                  }`}
              />
            </div>

            {/* Sex & Age Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div
                className="form-field group rounded-2xl border-2 border-green-200 bg-white p-6 shadow-md transition-all hover:shadow-lg"
                style={{ animationDelay: '50ms' }}
              >
                <Label className="mb-3 flex items-center gap-2 text-base font-bold text-gray-800">
                  <User className="h-5 w-5 text-green-600" />
                  Sex
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={data.sex}
                  onValueChange={(value) => setData("sex", value)}
                >
                  <SelectTrigger className="border-2 border-gray-300 text-base font-medium transition-all hover:border-green-400">
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male" className="cursor-pointer font-medium">
                      Male
                    </SelectItem>
                    <SelectItem value="Female" className="cursor-pointer font-medium">
                      Female
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div
                className="form-field group rounded-2xl border-2 border-green-200 bg-white p-6 shadow-md transition-all hover:shadow-lg"
                style={{ animationDelay: '100ms' }}
              >
                <Label className="mb-3 flex items-center gap-2 text-base font-bold text-gray-800">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Age (years)
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="Enter age"
                  value={data.age}
                  onChange={(e) => setData("age", e.target.value)}
                  onFocus={() => setFocusedField("age")}
                  onBlur={() => setFocusedField(null)}
                  min="0"
                  className={`border-2 text-base font-medium transition-all ${focusedField === "age" ? "input-focus" : "border-gray-300"
                    }`}
                />
              </div>
            </div>

            {/* Weight & Height Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div
                className="form-field group rounded-2xl border-2 border-green-200 bg-white p-6 shadow-md transition-all hover:shadow-lg"
                style={{ animationDelay: '150ms' }}
              >
                <Label className="mb-3 flex items-center gap-2 text-base font-bold text-gray-800">
                  <Weight className="h-5 w-5 text-green-600" />
                  Weight (kg)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Enter weight"
                  value={data.weight}
                  onChange={(e) => setData("weight", e.target.value)}
                  onFocus={() => setFocusedField("weight")}
                  onBlur={() => setFocusedField(null)}
                  min="0"
                  max="200"
                  className={`border-2 text-base font-medium transition-all ${focusedField === "weight" ? "input-focus" : "border-gray-300"
                    }`}
                />
                <p className="mt-2 text-xs text-gray-500">Maximum: 200 kg</p>
              </div>

              <div
                className="form-field group rounded-2xl border-2 border-green-200 bg-white p-6 shadow-md transition-all hover:shadow-lg"
                style={{ animationDelay: '200ms' }}
              >
                <Label className="mb-3 flex items-center gap-2 text-base font-bold text-gray-800">
                  <Ruler className="h-5 w-5 text-green-600" />
                  Height (cm)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Enter height"
                  value={data.height}
                  onChange={(e) => setData("height", e.target.value)}
                  onFocus={() => setFocusedField("height")}
                  onBlur={() => setFocusedField(null)}
                  min="0"
                  max="250"
                  className={`border-2 text-base font-medium transition-all ${focusedField === "height" ? "input-focus" : "border-gray-300"
                    }`}
                />
                <p className="mt-2 text-xs text-gray-500">Maximum: 250 cm</p>
              </div>
            </div>

            {/* BMI Calculator Display */}
            {bmi && (
              <div className="form-field rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Body Mass Index (BMI)</p>
                    <p className="text-3xl font-bold text-blue-600">{bmi}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-600">Status</p>
                    <p className={`text-xl font-bold ${getBMIStatus(Number(bmi)).color}`}>
                      {getBMIStatus(Number(bmi)).text}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Number & Barangay Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div
                className="form-field group rounded-2xl border-2 border-green-200 bg-white p-6 shadow-md transition-all hover:shadow-lg"
                style={{ animationDelay: '250ms' }}
              >
                <Label className="mb-3 flex items-center gap-2 text-base font-bold text-gray-800">
                  <Phone className="h-5 w-5 text-green-600" />
                  Guardian Contact Number
                </Label>
                <Input
                  type="tel"
                  placeholder="+63 XXX XXX XXXX"
                  value={displayPhoneNumber(data.contact_number)}
                  onChange={handlePhoneNumberChange}
                  onFocus={() => setFocusedField("contact_number")}
                  onBlur={() => setFocusedField(null)}
                  className={`border-2 text-base font-medium transition-all ${focusedField === "contact_number" ? "input-focus" : "border-gray-300"
                    }`}
                />
                <p className="mt-2 text-xs text-gray-500">Format: +63 XXX XXX XXXX</p>
              </div>

              <div
                className="form-field group rounded-2xl border-2 border-gray-200 bg-gray-50 p-6 shadow-md"
                style={{ animationDelay: '300ms' }}
              >
                <Label className="mb-3 flex items-center gap-2 text-base font-bold text-gray-600">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  Barangay
                </Label>
                <Input
                  type="text"
                  value={data.barangay ?? ""}
                  readOnly
                  className="cursor-not-allowed border-2 border-gray-300 bg-gray-100 text-base font-medium text-gray-600"
                />
                <p className="mt-2 text-xs text-gray-500">Auto-assigned from your account</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 border-t-2 border-gray-200 pt-8 sm:flex-row sm:justify-center">
              <Button
                type="submit"
                disabled={processing}
                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-12 py-6 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {processing ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 transition-transform group-hover:rotate-12" />
                      Register Child
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 transition-opacity group-hover:opacity-100" />
              </Button>

              <Button
                type="button"
                onClick={handleClose}
                className="rounded-full border-2 border-gray-300 bg-white px-12 py-6 text-lg font-bold text-gray-700 shadow-md transition-all hover:scale-105 hover:border-gray-400 hover:bg-gray-50 hover:shadow-lg"
              >
                Cancel
              </Button>
            </div>

            {/* Info Footer */}
            <div className="rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="h-6 w-6 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">Quick Tips:</p>
                  <ul className="mt-2 space-y-1 text-sm text-green-700">
                    <li>• All fields marked with <span className="text-red-500">*</span> are required</li>
                    <li>• Contact number helps us reach guardians for important updates</li>
                    <li>• Weight and height are used to calculate BMI automatically</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
