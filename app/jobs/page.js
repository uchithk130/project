"use client";
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import JobDetails from '../components/jobdetails'; // Import the JobDetails component

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [showActive, setShowActive] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null); // State to hold the selected job for details

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch('/api/jobs');
        const data = await response.json();
        console.log(data); // Debugging: Inspect fetched data
        setJobs(data);
        setFilteredJobs(data); // Initialize filtered jobs
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    }
    fetchJobs();
  }, []);

  // Get unique company names for the dropdown
  const companyNames = Array.from(new Set(jobs.map(job => job.company_name)));
  console.log(companyNames); // Debugging: Inspect unique company names

  // Filter jobs based on selected company and active status
  const handleFilter = () => {
    let updatedJobs = jobs;

    // Filter by selected company
    if (selectedCompany) {
      updatedJobs = updatedJobs.filter(job => job.company_name === selectedCompany);
    }

    // Filter by active status
    if (showActive) {
      updatedJobs = updatedJobs.filter(job => new Date(job.last_date_to_apply) > new Date());
    }

    setFilteredJobs(updatedJobs);
  };

  // Update filters and reapply when filters change
  useEffect(() => {
    handleFilter();
  }, [selectedCompany, showActive, jobs]);

  return (
    <div className="container mx-auto min-h-screen p-10 bg-gradient-to-br from-indigo-50 to-gray-200">
      <h1 className="text-5xl font-bold text-center mb-12 text-indigo-700">Job Listings</h1>

      {/* Filter Section */}
      <div className="flex justify-between mb-8">
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-indigo-500"
        >
          <option value="">All Companies</option>
          {companyNames.map((company, index) => (
            <option key={index} value={company}>{company}</option>
          ))}
        </select>

        <div className="flex items-center">
          <label className="mr-2 text-gray-700">Show Active Only:</label>
          <input
            type="checkbox"
            checked={showActive}
            onChange={() => setShowActive(!showActive)}
            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredJobs.map((job) => (
          <div key={job.job_id} className="bg-white shadow-lg rounded-lg p-6 transition-transform transform hover:scale-105 hover:shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">{job.job_title}</h2>
              <span className={`text-sm font-semibold px-2 py-1 rounded-full ${new Date(job.last_date_to_apply) > new Date() ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {new Date(job.last_date_to_apply) > new Date() ? 'Active' : 'Closed'}
              </span>
            </div>
            <p className="text-gray-600 mb-2">Company: <span className="font-semibold">{job.company_name}</span></p>
            <p className="text-gray-500 mb-4">Last Date: {format(new Date(job.last_date_to_apply), 'MMMM d, yyyy')}</p>
            <div className="flex justify-between items-center">
              <button
                onClick={() => setSelectedJob(job)} // Set selected job
                className="text-indigo-600 hover:underline transition duration-200"
              >
                Get Details
              </button>
              <div className="flex space-x-2">
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200 shadow-lg hover:shadow-xl">Save for Later</button>
                <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200 shadow-lg hover:shadow-xl">Apply</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Job Details Modal */}
      <JobDetails job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
