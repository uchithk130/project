"use client";
 
import { useState } from "react";
import { toast } from "react-hot-toast";
import { BriefcaseIcon, ClipboardIcon, CalendarIcon, CheckCircleIcon, GlobeAltIcon } from '@heroicons/react/outline';
import { useUser } from '@clerk/nextjs'; // Import useUser from Clerk
import ReactMarkdown from "react-markdown"; // Import ReactMarkdown
 
export default function JobAddForm() {
  const { user } = useUser();
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [domain, setDomain] = useState('');
  const [description, setDescription] = useState(''); // For markdown input
  const [eligibilityCriteria, setEligibilityCriteria] = useState(''); // For markdown input
  const [lastDateToApply, setLastDateToApply] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Show loading spinner
    setIsLoading(true);
    const loadingToast = toast.loading("Adding job...");

    try {
      const response = await fetch("/api/jobentry", {
        method: "POST",
        body: JSON.stringify({ 
          jobTitle, 
          company, 
          domain, 
          description, 
          eligibilityCriteria, 
          lastDateToApply,
          email: user.primaryEmailAddress.emailAddress
        }),
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Job added successfully!", { id: loadingToast });
        // Clear form fields
        setJobTitle('');
        setCompany('');
        setDomain('');
        setDescription('');
        setEligibilityCriteria('');
        setLastDateToApply('');
      } else {
        toast.error(`Failed to add job: ${result.error}`, { id: loadingToast });
      }
    } catch (error) {
      toast.error("An unexpected error occurred!", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center bg-white rounded-xl shadow-lg backdrop-blur-md p-10">
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
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
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
              <label className="block text-lg font-medium text-gray-600 mb-1">Domain</label>
              <div className="relative">
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Enter domain"
                  className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
                <GlobeAltIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
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

          <div className="flex-1 px-4">
            <label className="block text-lg font-medium text-gray-600 mb-1">Job Description</label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Enter job description with markdown (e.g., **bold**, *italic*, bullet points)"
                className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
              <ClipboardIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            {/* Render markdown */}
            <ReactMarkdown>{description}</ReactMarkdown>
          </div>

          <div className="flex-1 px-4">
            <label className="block text-lg font-medium text-gray-600 mb-1">Eligibility Criteria</label>
            <div className="relative">
              <textarea
                value={eligibilityCriteria}
                onChange={(e) => setEligibilityCriteria(e.target.value)}
                required
                placeholder="Enter eligibility criteria with markdown"
                className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
              <CheckCircleIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            {/* Render markdown */}
            <ReactMarkdown>{eligibilityCriteria}</ReactMarkdown>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className={`bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white inline-block mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291a8.001 8.001 0 01-1.664-1.867l-3.536 2.04A10 10 0 006 21.98v-4.689zm7.292-7.291a8.001 8.001 0 01-1.867 1.664l2.04 3.536A10 10 0 0019.98 18h-4.689z"
                  />
                </svg>
              ) : (
                'Add Job'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
