import JobAddForm from '../components/JobAddForm';
 
import { Toaster } from 'react-hot-toast';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <JobAddForm />
      <Toaster position="top-right" />
    </div>
  );
}
