// components/JobDetails.js
"use client";

import React from 'react';
import { format } from 'date-fns';

const JobDetails = ({ job, onClose }) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-lg w-full">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">{job.job_title}</h2>

        <p className="text-gray-600 mb-2">
          Company: <span className="font-semibold">{job.company}</span>
        </p>
        
        {job.domain && (
          <p className="text-gray-600 mb-2">
            Domain: <span className="font-semibold">{job.domain}</span>
          </p>
        )}

        <p className="text-gray-500 mb-2">
          Last Date to Apply: {format(new Date(job.last_date_to_apply), 'MMMM d, yyyy')}
        </p>

        <p className="text-gray-500 mb-2">
          Job ID: {job.job_id}
        </p>

        <p className="text-gray-700 mb-4">
          <strong>Job Description:</strong> <br />
          {job.description || "No description available"}
        </p>

        <p className="text-gray-700 mb-4">
          <strong>Eligibility Criteria:</strong> <br />
          {job.eligibility || "No criteria specified"}
        </p>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
