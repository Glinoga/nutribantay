import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { SharedData } from '@/types';

export default function Edit() {
  const { healthlog, children } = usePage<SharedData & { healthlog: any; children: any[] }>().props;

  const { data, setData, put, processing, errors } = useForm({
    child_id: healthlog.child_id || '',
    weight: healthlog.weight || '',
    height: healthlog.height || '',
    bmi: healthlog.bmi || '',
    zscore_wfa: healthlog.zscore_wfa || '',
    zscore_lfa: healthlog.zscore_lfa || '',
    zscore_wfh: healthlog.zscore_wfh || '',
    nutrition_status: healthlog.nutrition_status || '',
    micronutrient_powder: healthlog.micronutrient_powder || '',
    ruf: healthlog.ruf || '',
    rusf: healthlog.rusf || '',
    complementary_food: healthlog.complementary_food || '',
    vitamin_a: healthlog.vitamin_a || false,
    deworming: healthlog.deworming || false,
    vaccine_name: healthlog.vaccine_name || '',
    dose_number: healthlog.dose_number || '',
    date_given: healthlog.date_given || '',
    next_due_date: healthlog.next_due_date || '',
    vaccine_status: healthlog.vaccine_status || '',
  });

  // 🔹 Auto compute BMI and nutrition status
  useEffect(() => {
    if (data.weight && data.height) {
      const heightM = parseFloat(data.height) / 100;
      const bmi = parseFloat(data.weight) / (heightM * heightM);
      const roundedBMI = bmi ? bmi.toFixed(2) : '';

      setData('bmi', roundedBMI);

      let status = '';
      if (bmi < 14) status = 'Underweight';
      else if (bmi >= 14 && bmi < 18) status = 'Normal';
      else if (bmi >= 18) status = 'Overweight';
      setData('nutrition_status', status);
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

          {/* Nutrition Status */}
          <div>
            <label className="block font-medium">Nutrition Status</label>
            <input
              name="nutrition_status"
              value={data.nutrition_status}
              readOnly
              className="w-full border px-3 py-2 rounded bg-gray-100"
            />
          </div>

          {/* Supplementary Programs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Micronutrient Powder</label>
              <input
                name="micronutrient_powder"
                value={data.micronutrient_powder}
                onChange={(e) => setData('micronutrient_powder', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block font-medium">Complementary Food</label>
              <input
                name="complementary_food"
                value={data.complementary_food}
                onChange={(e) => setData('complementary_food', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">RUF (Ready-to-Use Food)</label>
              <input
                name="ruf"
                value={data.ruf}
                onChange={(e) => setData('ruf', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block font-medium">RUSF (Ready-to-Use Supplementary Food)</label>
              <input
                name="rusf"
                value={data.rusf}
                onChange={(e) => setData('rusf', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* Vitamin A & Deworming */}
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

          {/* Vaccines */}
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
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={processing}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              {processing ? 'Updating...' : 'Update'}
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
