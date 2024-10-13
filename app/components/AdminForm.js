"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function AdminForm() {
  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eligibility_criteria, setEligibilityCriteria] = useState('');
  const [lastDateToApply, setLastDateToApply] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading('Adding job...');

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        body: JSON.stringify({ jobTitle, description, eligibility_criteria, lastDateToApply }),
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Job added successfully!', { id: loadingToast });
        // Optionally, reset the form after success
        setJobTitle('');
        setDescription('');
        setEligibilityCriteria('');
        setLastDateToApply('');
      } else {
        toast.error(`Failed to add job: ${result.error}`, { id: loadingToast });
      }
    } catch (error) {
      toast.error('An unexpected error occurred!', { id: loadingToast });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 shadow-lg rounded-lg max-w-md mx-auto"
    >
      <label className="block mb-2 text-lg font-semibold">Job Title:</label>
      <input
        type="text"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        required
        className="w-full p-2 border rounded-md mb-4"
      />

      <label className="block mb-2 text-lg font-semibold">Job Description:</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className="w-full p-2 border rounded-md mb-4"
      />

      <label className="block mb-2 text-lg font-semibold">Eligibility Criteria:</label>
      <textarea
        value={eligibility_criteria}
        onChange={(e) => setEligibilityCriteria(e.target.value)}
        required
        className="w-full p-2 border rounded-md mb-4"
      />

      <label className="block mb-2 text-lg font-semibold">Last Date to Apply:</label>
      <input
        type="date"
        value={lastDateToApply}
        onChange={(e) => setLastDateToApply(e.target.value)}
        required
        className="w-full p-2 border rounded-md mb-4"
      />

      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
      >
        Add Job
      </button>
    </form>
  );
}
