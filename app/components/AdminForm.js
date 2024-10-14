
"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { BriefcaseIcon, ClipboardIcon, CalendarIcon, CheckCircleIcon } from '@heroicons/react/outline';

export default function AdminForm() {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [eligibilityCriteria, setEligibilityCriteria] = useState('');
  const [lastDateToApply, setLastDateToApply] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading("Adding job...");

    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        body: JSON.stringify({ jobTitle, description, eligibilityCriteria, lastDateToApply ,companyName}),
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Job added successfully!", { id: loadingToast });
        setJobTitle('');
        setCompanyName('');
        setDescription('');
        setEligibilityCriteria('');
        setLastDateToApply('');
      } else {
        toast.error(`Failed to add job: ${result.error}`, { id: loadingToast });
      }
    } catch (error) {
      toast.error("An unexpected error occurred!", { id: loadingToast });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-1000 h-full flex flex-col items-center justify-center bg-white rounded-xl shadow-lg backdrop-blur-md p-10">
        <h2 className="text-4xl font-bold text-gray-700 mb-6 text-center">
          <BriefcaseIcon className="h-8 w-8 inline-block text-blue-500 mr-2" />
          Add New Job
        </h2>
        <form onSubmit={handleSubmit} className="w-full max-w-4xl space-y-6">
          <div className="flex flex-wrap -mx-4">
            <div className="flex-1 px-4">
              <label className="block text-lg font-medium text-gray-600 mb-1">Job Title</label>
              <div className="relative">
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                  placeholder="Enter job title"
                  className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
                <BriefcaseIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
            <div className="flex-1 px-4">
              <label className="block text-lg font-medium text-gray-600 mb-1">Company Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  placeholder="Enter company name"
                  className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
                <BriefcaseIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap -mx-4">
          <div className="flex-1 px-4">
          <label className="block text-lg font-medium text-gray-600 mb-1">Eligibility Criteria</label>
            <div className="relative">
              <textarea
                value={eligibilityCriteria}
                onChange={(e) => setEligibilityCriteria(e.target.value)}
                required
                placeholder="Enter eligibility criteria"
                className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
              <CheckCircleIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            </div>
            <div className="flex-1 px-4">
              <label className="block text-lg font-medium text-gray-600 mb-1">Last Date to Apply</label>
              <div className="relative">
                <input
                  type="date"
                  value={lastDateToApply}
                  onChange={(e) => setLastDateToApply(e.target.value)}
                  required
                  className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
                <CalendarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div>
          <div className="flex-1 px-4">
              <label className="block text-lg font-medium text-gray-600 mb-1">Job Description</label>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Enter job description"
                  className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
                <ClipboardIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
          </div>
          

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            >
              Add Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
