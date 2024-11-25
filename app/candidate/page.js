import CandidateForm from '../components/CandidateForm';

import { Toaster } from 'react-hot-toast';

export default function CandidatePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <CandidateForm />
      <Toaster position="top-right" />
    </div>
  );
}
