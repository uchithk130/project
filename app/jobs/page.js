
"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import AnimationPopup from "../components/AnimationPopup";
import { useUser } from "@clerk/nextjs";

export default function Jobs() {
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [showActive, setShowActive] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [animationVisible, setAnimationVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoName, setPhotoName] = useState("");

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch("/api/jobs");
        const data = await response.json();
        setJobs(data);
        setFilteredJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    }
    fetchJobs();
  }, []);

  const companyNames = Array.from(new Set(jobs.map((job) => job.company)));

  const handleFilter = () => {
    let updatedJobs = jobs;

    if (selectedCompany) {
      updatedJobs = updatedJobs.filter((job) => job.company === selectedCompany);
    }

    if (showActive) {
      updatedJobs = updatedJobs.filter((job) => new Date(job.last_date_to_apply) > new Date());
    }

    setFilteredJobs(updatedJobs);
  };

  useEffect(() => {
    handleFilter();
  }, [selectedCompany, showActive, jobs]);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]); 
      reader.onerror = (error) => reject(error);
    });
  };


  const handleApply = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      alert("User not authenticated");
      return;
    }

    if (!resume || !photo) {
      alert("Please upload both resume and photo.");
      return;
    }

    const resumeBase64 = resume ? await fileToBase64(resume) : null;
    const photoBase64 = photo ? await fileToBase64(photo) : null;

    const candidateEmail = user.primaryEmailAddress.emailAddress;
    setLoading(true);

    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: candidateEmail,
          jobId: selectedJob?.job_id,
          resumeBase64: resumeBase64,
          resumeName: resumeName,
          photoBase64: photoBase64,
          photoName: photoName,
        }),
      });
      console.log(JSON.stringify({
        email: candidateEmail,
        jobId: selectedJob?.job_id,
        resumeBase64: resumeBase64,
        resumeName: resumeName,
        photoBase64: photoBase64,
        photoName: photoName,
      }));
      if (!response.ok) throw new Error("Failed to apply for job.");

      setAnimationVisible(true);
      setTimeout(() => setAnimationVisible(false), 3000);
    } catch (error) {
      console.error("Error applying for job:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto min-h-screen p-10 bg-gradient-to-br from-indigo-50 to-gray-200">
      <h1 className="text-5xl font-bold text-center mb-12 text-indigo-700">Job Listings</h1>

      <div className="flex justify-between mb-8">
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-indigo-500"
        >
          <option value="">All Companies</option>
          {companyNames.map((company, index) => (
            <option key={index} value={company}>
              {company}
            </option>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredJobs.map((job) => (
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
              Last Date: {format(new Date(job.last_date_to_apply), "MMMM d, yyyy")}
            </p>
            <div className="flex flex-col">
              <button
                onClick={() => setSelectedJob(job)}
                className="text-indigo-600 hover:underline transition duration-200 mb-2"
              >
                Get Details
              </button>

              {selectedJob?.job_id === job.job_id && (
                <div className="mt-4">
                  <label className="block text-gray-700 font-semibold mb-1">Upload Resume:</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setResume(file);
                      setResumeName(file.name);
                    }}
                    className="mb-2 border rounded-md p-2"
                  />
                  <label className="block text-gray-700 font-semibold mb-1">Upload Photo:</label>
                  <input
                    type="file"
                    accept=".jpg, .jpeg, .png"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setPhoto(file);
                      setPhotoName(file.name);
                    }}
                    className="mb-4 border rounded-md p-2"
                  />
                  <button
                    onClick={handleApply}
                    disabled={loading}
                    className={`bg-blue-500 text-white px-4 py-2 rounded-md transition duration-200 shadow-lg hover:shadow-xl ${
                      loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                    }`}
                  >
                    {loading ? "Applying..." : "Apply"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {animationVisible && <AnimationPopup />}
    </div>
  );
}
