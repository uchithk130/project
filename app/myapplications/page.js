
'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { format } from 'date-fns';
import JobDetails from '../components/JobDetails';
import ResumePreview from "../components/ResumePreview";
import PhotoPreview from "../components/PhotoPreview";

const MyApplications = () => {
  const { user } = useUser();
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetailsPopup, setShowJobDetailsPopup] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState(null);
  const [loading, setLoading] = useState(true);

  const [resumePreviewVisible, setResumePreviewVisible] = useState(false);
  const [photoPreviewVisible, setPhotoPreviewVisible] = useState(false);
  const [resume, setResume] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (user) {
        try {
          setLoading(true);
          // Fetch candidate ID based on user email
          const candidateResponse = await axios.get(`/api/candidates?email=${user.primaryEmailAddress.emailAddress}`);
          const candidateId = candidateResponse.data.candidate_id;
          setName(candidateResponse.data.name);

          // Fetch job applications for that candidate ID
          const applicationsResponse = await axios.get(`/api/jobapplications?candidate_id=${candidateId}`);
          const jobIds = applicationsResponse.data.map(app => app.job_id);

          // Fetch job details based on job IDs
          const jobsResponse = await axios.get(`/api/job`, {
            params: { job_ids: jobIds }
          });

          // Combine applications with job details
          const applicationsWithDetails = applicationsResponse.data.map((app, index) => ({
            ...jobsResponse.data[index],
            applied_on: app.applied_at,
            resume: app.resume,
            photo: app.photo
          }));

          setApplications(applicationsWithDetails);
        } catch (err) {
          setError('Failed to fetch applications.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchApplications();
  }, [user]);

  if (loading) {
    return (
            <div className="container mx-auto min-h-screen p-10 bg-gradient-to-br from-green-50 to-gray-200">
              <h1 className="text-5xl font-bold text-center mb-12 text-green-800">My Applications</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white shadow-md rounded-lg p-6 animate-pulse">
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/4 mb-2"></div>
                    </div>
                    <p className="h-4 bg-gray-300 rounded mb-2"></p>
                    <p className="h-4 bg-gray-300 rounded mb-2 w-1/2"></p>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
  }

  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!applications.length) return <div className="text-center text-lg">No applications found.</div>;

  return (
    <div className="container mx-auto min-h-screen p-10 bg-gradient-to-br from-green-50 to-gray-200">
      <h1 className="text-5xl font-bold text-center mb-12 text-green-800">My Applications</h1>
      <h2 className="text-2xl font-semibold text-center mb-6">Hi, {name}!</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {applications.map((job) => (
          <div
            key={job.job_id}
            className="bg-white shadow-lg rounded-lg p-6 transition-transform transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">{job.job_title}</h2>
              <span
                className={`text-sm font-semibold px-2 py-1 rounded-full ${
                  new Date(job.last_date_to_apply) > new Date()
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {new Date(job.last_date_to_apply) > new Date() ? "Active" : "Closed"}
              </span>
            </div>
            <p className="text-gray-600 mb-2">
              Company: <span className="font-semibold">{job.company}</span>
            </p>
            <p className="text-gray-500 mb-4">
              Applied On: {job.applied_on ? format(new Date(job.applied_on), "MMMM d, yyyy") : "N/A"}
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setSelectedJob(job);
                  setShowJobDetailsPopup(true);
                }}
                className="text-indigo-600 hover:underline transition duration-200"
              >
                Get Details
              </button>
              <button
                onClick={() => {
                  setResume(job.resume);
                  setResumePreviewVisible(true);
                }}
                className="text-green-600 hover:underline transition duration-200"
              >
                Resume View
              </button>
              <button
                onClick={() => {
                  setPhotoPreview(job.photo);
                  setPhotoPreviewVisible(true);
                }}
                className="text-blue-600 hover:underline transition duration-200"
              >
                Photo View
              </button>
            </div>
          </div>
        ))}
      </div>

      {resumePreviewVisible && (
        <ResumePreview
          resume={resume}
          onClose={() => setResumePreviewVisible(false)}
        />
      )}

      {photoPreviewVisible && (
        <PhotoPreview
          photoPreview={photoPreview}
          onClose={() => setPhotoPreviewVisible(false)}
        />
      )}

      {showJobDetailsPopup && selectedJob && (
        <JobDetails
          job={selectedJob}
          onClose={() => setShowJobDetailsPopup(false)}
        />
      )}
    </div>
  );
};

export default MyApplications;
