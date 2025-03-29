"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ResumePreview from "../components/ResumePreview";
import DisplayExtractedData from "../components/DisplayExtractData";

export default function StartInterview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("id");

  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState(false);
  const [resumePreviewVisible, setResumePreviewVisible] = useState(false);
  const [viewPreviewVisible, setViewPreviewVisible] = useState(false);

  useEffect(() => {
    if (!applicationId) {
      router.push("/"); // Redirect if no ID provided
      return;
    }

    const fetchApplicationData = async () => {
      try {
        const response = await fetch(`/api/getApplication?id=${applicationId}`);
        const data = await response.json();
        setApplicationData(data);
        console.log(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching application data:", error);
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [applicationId, router]);

  if (loading) {
    return <div className="text-center text-lg font-medium">Loading...</div>;
  }

  if (!applicationData) {
    return (
      <div className="text-center text-lg font-medium text-red-500">
        No application data found.
      </div>
    );
  }

  const { job_id, candidate_id, resume, photo, applied_at, extracted_data } = applicationData;

  const handleInitiateInterview = () => {
    if (!verification) {
      alert("Please verify the candidate details before initiating the interview.");
      return;
    }

    router.push(`/speech-to-text?id=${applicationId}`);
  };

  return (
    <div className="min-h-screen bg-[#effeff]">
      <div className="container mx-auto p-6">
        <div className="relative bg-white shadow-lg rounded-lg p-8 border border-gray-200 max-w-4xl mx-auto">
          {/* Candidate Photo on the Top Right */}
          <div className="absolute top-4 right-4">
            <img
              src={photo}
              alt="Candidate Photo"
              className="w-24 h-24 rounded-full border-4 border-gray-300 shadow-lg"
            />
          </div>
  
          {/* Page Title */}
          <h1 className="text-4xl font-bold text-center text-[#00796b] mb-6">
            Verify Candidate Details
          </h1>
  
          {/* Candidate Information Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Candidate Information</h2>
            <div className="grid grid-cols-2 gap-4 text-gray-600">
              <p>
                <strong>Application ID:</strong> {applicationId}
              </p>
              <p>
                <strong>Candidate ID:</strong> {candidate_id}
              </p>
              <p>
                <strong>Job ID:</strong> {job_id}
              </p>
              <p>
                <strong>Applied At:</strong> {new Date(applied_at).toLocaleString()}
              </p>
            </div>
          </div>
  
          {/* Resume & Extracted Data Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Details</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Resume Preview Button */}
              <div>
                <p className="text-gray-600 font-medium mb-2">Uploaded Resume:</p>
                <button
                  className="text-blue-500 underline"
                  onClick={() => setResumePreviewVisible(true)}
                >
                  Preview Resume
                </button>
              </div>
  
              {/* Extracted Data Button */}
              <div>
                <p className="text-gray-600 font-medium mb-2">Extracted Details:</p>
                <button
                  className="text-blue-500 underline"
                  onClick={() => setViewPreviewVisible(true)}
                >
                  View Extracted Data
                </button>
              </div>
            </div>
          </div>
  
          {/* Verification Checkbox */}
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="verify"
              checked={verification}
              onChange={(e) => setVerification(e.target.checked)}
              className="w-5 h-5 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
            />
            <label
              htmlFor="verify"
              className="ml-2 text-gray-700 font-medium cursor-pointer"
            >
              I verify that the above candidate details are correct.
            </label>
          </div>
  
          {/* Initiate Interview Button */}
          <button
            className={`w-full py-3 text-white font-semibold rounded-lg ${
              verification
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={handleInitiateInterview}
            disabled={!verification}
          >
            Initiate Interview
          </button>
        </div>
      </div>
  
      {/* Resume Preview Modal */}
      {resumePreviewVisible && (
        <ResumePreview resume={resume} onClose={() => setResumePreviewVisible(false)} />
      )}
  
      {/* Extracted Data Modal */}
      {viewPreviewVisible && (
        <DisplayExtractedData
          extractedData={extracted_data.extractedData}
          resumeUrl={resume}
          photoUrl={photo}
          onClose={() => setViewPreviewVisible(false)}
        />
      )}
    </div>
  );
}  