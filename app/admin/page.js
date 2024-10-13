import AdminForm from '../components/AdminForm';

import { Toaster } from 'react-hot-toast';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
        Admin - Add Job
      </h1>
      <AdminForm />
      <Toaster position="top-right" />
    </div>
  );
}
