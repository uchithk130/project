"use client"
import { useState, useEffect } from 'react';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  
  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch('/api/jobs');
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    }
    fetchJobs();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Job Listings</h1>
      <div className="grid grid-cols-1 gap-4">
        {jobs.map((job) => (
          <div key={job.job_id} className="bg-white shadow-md rounded-lg p-4 relative">
            <div className="absolute top-2 right-2">
              {new Date(job.last_date_to_apply) > new Date() ? (
                <span className="text-green-500 font-semibold">Active</span>
              ) : (
                <span className="text-red-500 font-semibold">Closed</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">{job.job_title}</div>
              <div>{job.company_name}</div>
            </div>
            <div className="text-center mt-2">Last Date: {job.last_date_to_apply}</div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => alert(JSON.stringify(job, null, 2))}
                className="text-blue-500"
              >
                Get Details
              </button>
              <div>
                <button className="bg-blue-500 text-white px-3 py-1 rounded-md mr-2">Save for Later</button>
                <button className="bg-green-500 text-white px-3 py-1 rounded-md">Apply</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
