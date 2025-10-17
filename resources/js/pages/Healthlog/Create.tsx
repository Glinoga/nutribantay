import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { SharedData } from '@/types';

export default function Create() {
  const { auth, children } = usePage<SharedData & { children: any[] }>().props;

  const { data, setData, post, processing, errors } = useForm({
    child_id: '',
    weight: '',
    height: '',
    bmi: '',
    zscore_wfa: '',
    zscore_lfa: '',
    zscore_wfh: '',
    nutrition_status: '',
    micronutrient_powder: '',
    ruf: '',
    rusf: '',
    complementary_food: '',
    vitamin_a: false,
    deworming: false,
    vaccine_name: '',
    dose_number: '',
    date_given: '',
    next_due_date: '',
    vaccine_status: '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/healthlogs');
  };

  return (
    <AppLayout>
      <Head title="Add Health Log" />

      <div className="m-4">
        <h1 className="text-xl font-bold mb-4">Add Health Log</h1>

        <form onSubmit={submit} className="space-y-4 max-w-2xl">
          {/* Child Dropdown */}
          <div>
            <label className="block font-medium">Select Child</label>
            <select
              name="child_id"
              value={data.child_id}
              onChange={(e) => setData('child_id', e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="">-- Select a child --</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name} ({child.sex}) – {child.birthdate}
                </option>
              ))}
            </select>
            {errors.child_id && <div className="text-red-600">{errors.child_id}</div>}
          </div>

          {/* Measurements */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-medium">Weight (kg)</label>
              <input
                name="weight"
                type="number"
                step="0.01"
                value={data.weight}
                onChange={(e) => setData('weight', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
              {errors.weight && <div className="text-red-600">{errors.weight}</div>}
            </div>

            <div>
              <label className="block font-medium">Height (cm)</label>
              <input
                name="height"
                type="number"
                step="0.01"
                value={data.height}
                onChange={(e) => setData('height', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
              {errors.height && <div className="text-red-600">{errors.height}</div>}
            </div>

            <div>
              <label className="block font-medium">BMI</label>
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

          {/* Nutrition Fields */}
          <div>
            <label className="block font-medium">Nutrition Status</label>
            <input
              name="nutrition_status"
              value={data.nutrition_status}
              readOnly
              className="w-full border px-3 py-2 rounded bg-gray-100"
            />
          </div>

          {/* Supplements */}
          <div className="flex items-center gap-4">
            <label>
              <input
                type="checkbox"
                name="vitamin_a"
                checked={data.vitamin_a}
                onChange={(e) => setData('vitamin_a', e.target.checked)}
              />{' '}
              Vitamin A
            </label>
            <label>
              <input
                type="checkbox"
                name="deworming"
                checked={data.deworming}
                onChange={(e) => setData('deworming', e.target.checked)}
              />{' '}
              Deworming
            </label>
          </div>

          {/* Vaccine Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Vaccine Name</label>
              <input
                name="vaccine_name"
                value={data.vaccine_name}
                onChange={(e) => setData('vaccine_name', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block font-medium">Dose Number</label>
              <input
                name="dose_number"
                type="number"
                value={data.dose_number}
                onChange={(e) => setData('dose_number', e.target.value)}
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
                onChange={(e) => setData('date_given', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block font-medium">Next Due Date</label>
              <input
                name="next_due_date"
                type="date"
                value={data.next_due_date}
                onChange={(e) => setData('next_due_date', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={processing}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {processing ? 'Saving...' : 'Save'}
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
