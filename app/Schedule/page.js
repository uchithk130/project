"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import ResumePreview from "../components/ResumePreview";
import PhotoPreview from "../components/PhotoPreview";

export default function JobApplications() {
  const { user } = useUser();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [jobIds, setJobIds] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [resumePreviewVisible, setResumePreviewVisible] = useState(false);
  const [photoPreviewVisible, setPhotoPreviewVisible] = useState(false);
  const [resume, setResume] = useState(null);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    async function fetchApplications() {
      const response = await fetch(`/api/fetchapplications?admin_email=${user.primaryEmailAddress.emailAddress}`);
      const data = await response.json();
      setApplications(data);
      setFilteredApplications(data);

      // Extract unique job IDs for the filter
      const uniqueJobIds = Array.from(new Set(data.map((app) => app.job_id)));
      setJobIds(uniqueJobIds);
    }

    if (user) {
      fetchApplications();
    }
  }, [user]);

  const handleJobIdFilter = (jobId) => {
    setSelectedJobId(jobId);
    if (jobId === "") {
      setFilteredApplications(applications);
    } else {
      const filtered = applications.filter((app) => app.job_id == jobId);
      setFilteredApplications(filtered);
    }
  };

  const handleSelection = (candidateId, action) => {
    console.log(`Candidate ID: ${candidateId} has been ${action}`);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Job Applications</h1>

      {applications.length > 0 && (
        <div className="mb-6 flex justify-center">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            value={selectedJobId}
            onChange={(e) => handleJobIdFilter(e.target.value)}
          >
            <option value="">All Job IDs</option>
            {jobIds.map((jobId) => (
              <option key={jobId} value={jobId}>
                {jobId}
              </option>
            ))}
          </select>
        </div>
      )}

      {filteredApplications.length === 0 ? (
        <p className="text-center text-lg text-gray-600">No job applications found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg shadow-md bg-white">
            <thead>
              <tr className="bg-blue-100 text-gray-800">
                <th className="px-6 py-4 text-left font-semibold">S. No</th>
                <th className="px-6 py-4 text-left font-semibold">Job ID</th>
                <th className="px-6 py-4 text-left font-semibold">Candidate ID</th>
                <th className="px-6 py-4 text-left font-semibold">Candidate Name</th>
                <th className="px-6 py-4 text-left font-semibold">Highest Education</th>
                <th className="px-6 py-4 text-left font-semibold">College Name</th>
                <th className="px-6 py-4 text-left font-semibold">Applied On</th>
                <th className="px-6 py-4 text-center font-semibold">Resume</th>
                <th className="px-6 py-4 text-center font-semibold">Photo</th>
                <th className="px-6 py-4 text-center font-semibold">Select/Reject</th>
                <th className="px-6 py-4 text-center font-semibold">Schedule</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application, index) => (
                <tr key={application.candidate_id} className="border-b hover:bg-gray-100">
                  <td className="px-6 py-4 text-gray-700">{index + 1}</td>
                  <td className="px-6 py-4 text-gray-700">{application.job_id}</td>
                  <td className="px-6 py-4 text-gray-700">{application.candidate_id}</td>
                  <td className="px-6 py-4 text-gray-700">{application.name}</td>
                  <td className="px-6 py-4 text-gray-700">{application.highest_education}</td>
                  <td className="px-6 py-4 text-gray-700">{application.college_name}</td>
                  <td className="px-6 py-4 text-gray-700">{new Date(application.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        setResume(application.resume);
                        setResumePreviewVisible(true);
                      }}
                      className="text-green-600 hover:text-green-800 font-medium transition"
                    >
                      View Resume
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        setPhoto(application.photo);
                        setPhotoPreviewVisible(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium transition"
                    >
                      View Photo
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleSelection(application.candidate_id, "Selected")}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition"
                    >
                      Select
                    </button>
                    <button
                      onClick={() => handleSelection(application.candidate_id, "Rejected")}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 ml-3 transition"
                    >
                      Reject
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
                    >
                      Schedule Interview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {resumePreviewVisible && (
        <ResumePreview
          resume={resume}
          onClose={() => setResumePreviewVisible(false)}
        />
      )}

      {photoPreviewVisible && (
        <PhotoPreview
          photoPreview={photo}
          onClose={() => setPhotoPreviewVisible(false)}
        />
      )}
    </div>
  );
}
