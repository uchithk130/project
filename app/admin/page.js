import AdminForm from '../components/AdminForm';
 
import { Toaster } from 'react-hot-toast';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminForm />
      <Toaster position="top-right" />
    </div>
  );
}
