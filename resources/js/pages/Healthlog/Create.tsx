import AppLayout from "@/layouts/app-layout";
import { Head, useForm, usePage, Link } from "@inertiajs/react";
import { useEffect } from "react";
import { SharedData } from "@/types";

export default function Create() {
  const { children } = usePage<SharedData & { children: any[] }>().props;

  const { data, setData, post, processing, errors } = useForm({
    child_id: "",
    weight: "",
    height: "",
    bmi: "",
    nutrition_status: "", // server calculates this

    micronutrient_powder: "",
    ruf: "",
    rusf: "",
    complementary_food: "",
    vitamin_a: false,
    deworming: false,

    vaccine_name: "",
    dose_number: "",
    date_given: "",
    next_due_date: "",
    vaccine_status: "",
  });

  // Auto-BMI calculator (weight kg, height cm → meters)
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
    post("/healthlogs");
  };

  return (
    <AppLayout>
      <Head title="Add Health Log" />

      <div className="m-4">
        <h1 className="text-xl font-bold mb-4">Add Health Log</h1>

        <form onSubmit={submit} className="space-y-4 max-w-2xl">
          {/* CHILD SELECT */}
          <div>
            <label className="block font-medium">Select Child</label>
            <select
              name="child_id"
              value={data.child_id}
              onChange={(e) => setData("child_id", e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="">-- Select a child --</option>

              {children.map((child) => (
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
                name="weight"
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
                name="height"
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
              <label className="block font-medium">BMI (auto)</label>
              <input
                name="bmi"
                type="number"
                step="0.01"
                value={data.bmi}
                readOnly
                className="w-full border px-3 py-2 rounded bg-gray-100"
              />
            </div>
          </div>

          {/* NUTRITION STATUS */}
          <div>
            <label className="block font-medium">Overall Nutrition Status</label>
            <input
              name="nutrition_status"
              value={data.nutrition_status}
              readOnly
              placeholder="Calculated after saving"
              className="w-full border px-3 py-2 rounded bg-gray-100"
            />
          </div>

          {/* SUPPLEMENTS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Micronutrient Powder</label>
              <input
                name="micronutrient_powder"
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
                name="complementary_food"
                value={data.complementary_food}
                onChange={(e) => setData("complementary_food", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* RUF / RUSF */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">RUF</label>
              <input
                name="ruf"
                value={data.ruf}
                onChange={(e) => setData("ruf", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block font-medium">RUSF</label>
              <input
                name="rusf"
                value={data.rusf}
                onChange={(e) => setData("rusf", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* CHECKBOXES */}
          <div className="flex items-center gap-6">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Vaccine Name</label>
              <input
                name="vaccine_name"
                value={data.vaccine_name}
                onChange={(e) => setData("vaccine_name", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block font-medium">Dose Number</label>
              <input
                name="dose_number"
                type="number"
                value={data.dose_number}
                onChange={(e) => setData("dose_number", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Date Given</label>
              <input
                name="date_given"
                type="date"
                value={data.date_given}
                onChange={(e) => setData("date_given", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block font-medium">Next Due Date</label>
              <input
                name="next_due_date"
                type="date"
                value={data.next_due_date}
                onChange={(e) => setData("next_due_date", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={processing}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {processing ? "Saving..." : "Save"}
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
