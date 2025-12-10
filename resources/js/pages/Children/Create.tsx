import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';

export default function Create() {
  const { auth } = usePage<SharedData>().props;

  const { data, setData, post, processing, errors } = useForm({
    first_name: '',
    middle_initial: '',
    last_name: '',
    sex: 'Male',
    birthdate: '',
    age: '',
    weight: '',
    height: '',
    barangay: auth.user.barangay || '',
    address: '',
    contact_number: '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/children');
  };

  return (
    <AppLayout>
      <Head title="Add Child" />

      <h1 className="mb-4 text-xl font-bold">Add Child</h1>

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
          {errors.first_name && (
            <div className="text-red-600">{errors.first_name}</div>
          )}
        </div>

        {/* MIDDLE INITIAL */}
        <div>
          <label className="block font-medium">Middle Initial</label>
          <input
            type="text"
            maxLength={2}
            value={data.middle_initial}
            onChange={(e) => setData('middle_initial', e.target.value.toUpperCase())}
            className="w-full rounded border p-2"
            placeholder="Optional"
          />
          {errors.middle_initial && (
            <div className="text-red-600">{errors.middle_initial}</div>
          )}
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
          {errors.last_name && (
            <div className="text-red-600">{errors.last_name}</div>
          )}
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
          {errors.birthdate && (
            <div className="text-red-600">{errors.birthdate}</div>
          )}
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
          {errors.weight && (
            <div className="text-red-600">{errors.weight}</div>
          )}
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
          {errors.height && (
            <div className="text-red-600">{errors.height}</div>
          )}
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
          {errors.address && (
            <div className="text-red-600">{errors.address}</div>
          )}
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
          {errors.contact_number && (
            <div className="text-red-600">{errors.contact_number}</div>
          )}
        </div>

        {/* BARANGAY */}
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
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          {processing ? 'Saving...' : 'Save'}
        </button>
      </form>
    </AppLayout>
  );
}
