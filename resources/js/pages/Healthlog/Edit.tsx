import AppLayout from "@/layouts/app-layout";
import { Head, useForm, Link } from "@inertiajs/react";
import { useEffect } from "react";

export default function Edit({ healthlog, children }: any) {
  const { data, setData, put, processing, errors } = useForm({
    child_id: healthlog.child_id ?? "",
    weight: healthlog.weight ?? "",
    height: healthlog.height ?? "",
    bmi: healthlog.bmi ?? "",
    nutrition_status: healthlog.nutrition_status ?? "",

    micronutrient_powder: healthlog.micronutrient_powder ?? "",
    ruf: healthlog.ruf ?? "",
    rusf: healthlog.rusf ?? "",
    complementary_food: healthlog.complementary_food ?? "",
    vitamin_a: !!healthlog.vitamin_a,
    deworming: !!healthlog.deworming,

    vaccine_name: healthlog.vaccine_name ?? "",
    dose_number: healthlog.dose_number ?? "",
    date_given: healthlog.date_given ?? "",
    next_due_date: healthlog.next_due_date ?? "",
    vaccine_status: healthlog.vaccine_status ?? "",
  });

  // Auto-calc BMI
  useEffect(() => {
    const w = parseFloat(data.weight);
    const h = parseFloat(data.height);

    if (w > 0 && h > 0) {
      const bmiValue = w / Math.pow(h / 100, 2); // cm → meters
      setData("bmi", bmiValue.toFixed(2));
    } else {
      setData("bmi", "");
    }
  }, [data.weight, data.height]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/healthlogs/${healthlog.id}`);
  };

  return (
    <AppLayout>
      <Head title="Edit Health Log" />

      <div className="m-4">
        <h1 className="text-xl font-bold mb-4">Edit Health Log</h1>

        <form onSubmit={submit} className="space-y-4 max-w-2xl">
          {/* CHILD SELECT */}
          <div>
            <label className="block font-medium mb-1">Child</label>
            <select
              value={data.child_id}
              onChange={(e) => setData("child_id", e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="">-- Select Child --</option>

              {children.map((child: any) => (
                <option key={child.id} value={child.id}>
                  {child.fullname} ({child.sex}) – {child.birthdate}
                </option>
              ))}
            </select>

            {errors.child_id && (
              <p className="text-red-600">{errors.child_id}</p>
            )}
          </div>

          {/* MEASUREMENTS */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-medium">Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                value={data.weight}
                onChange={(e) => setData("weight", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
              {errors.weight && (
                <p className="text-red-600">{errors.weight}</p>
              )}
            </div>

            <div>
              <label className="block font-medium">Height (cm)</label>
              <input
                type="number"
                step="0.01"
                value={data.height}
                onChange={(e) => setData("height", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
              {errors.height && (
                <p className="text-red-600">{errors.height}</p>
              )}
            </div>

            <div>
              <label className="block font-medium">BMI</label>
              <input
                type="text"
                value={data.bmi}
                readOnly
                className="w-full border px-3 py-2 rounded bg-gray-100"
              />
            </div>
          </div>

          {/* NUTRITION STATUS */}
          <div>
            <label className="block font-medium">Nutrition Status</label>
            <input
              value={data.nutrition_status}
              readOnly
              className="w-full border px-3 py-2 rounded bg-gray-100"
            />
          </div>

          {/* SUPPLEMENTARY PROGRAMS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Micronutrient Powder</label>
              <input
                value={data.micronutrient_powder}
                onChange={(e) =>
                  setData("micronutrient_powder", e.target.value)
                }
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block font-medium">Complementary Food</label>
              <input
                value={data.complementary_food}
                onChange={(e) =>
                  setData("complementary_food", e.target.value)
                }
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">RUF</label>
              <input
                value={data.ruf}
                onChange={(e) => setData("ruf", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block font-medium">RUSF</label>
              <input
                value={data.rusf}
                onChange={(e) => setData("rusf", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* CHECKBOXES */}
          <div className="flex gap-6 mt-2">
            <label>
              <input
                type="checkbox"
                checked={data.vitamin_a}
                onChange={(e) => setData("vitamin_a", e.target.checked)}
              />{" "}
              Vitamin A
            </label>

            <label>
              <input
                type="checkbox"
                checked={data.deworming}
                onChange={(e) => setData("deworming", e.target.checked)}
              />{" "}
              Deworming
            </label>
          </div>

          {/* VACCINATION */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block font-medium">Vaccine Name</label>
              <input
                value={data.vaccine_name}
                onChange={(e) => setData("vaccine_name", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block font-medium">Dose Number</label>
              <input
                type="number"
                value={data.dose_number}
                onChange={(e) => setData("dose_number", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block font-medium">Date Given</label>
              <input
                type="date"
                value={data.date_given}
                onChange={(e) => setData("date_given", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block font-medium">Next Due Date</label>
              <input
                type="date"
                value={data.next_due_date}
                onChange={(e) => setData("next_due_date", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-2 mt-6">
            <button
              type="submit"
              disabled={processing}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              {processing ? "Updating..." : "Update"}
            </button>

            <Link
              href="/healthlogs"
              className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
