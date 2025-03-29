"use client";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import Modal from "react-modal";
import { useUser } from "@clerk/nextjs";
import ResumePreview from "../components/ResumePreview";
import PhotoPreview from "../components/PhotoPreview";

// Import and register Chart.js components directly
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import { Bar } from "react-chartjs-2";

// Set Modal app element for accessibility (client-only)
if (typeof window !== "undefined") {
  Modal.setAppElement(document.body);
}

// Helper to safely parse the details JSON
const parseDetails = (details) => {
  if (typeof details === "string") {
    try {
      return JSON.parse(details);
    } catch (e) {
      console.error("Error parsing details:", e);
      return {};
    }
  }
  return details;
};

export default function ManagerInterviewReports() {
  const { user } = useUser();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [jobOptions, setJobOptions] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [scoreRange, setScoreRange] = useState({ overall: { min: "", max: "" } });
  const [techRange, setTechRange] = useState({ min: "", max: "" });
  const [behavRange, setBehavRange] = useState({ min: "", max: "" });
  const [selectedReport, setSelectedReport] = useState(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [selectionStatus, setSelectionStatus] = useState({}); // e.g., "3-7": "Selected" or "Rejected"
  const [resumePreviewVisible, setResumePreviewVisible] = useState(false);
  const [photoPreviewVisible, setPhotoPreviewVisible] = useState(false);

  // Fetch reports for jobs posted by this admin using their email
  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  async function fetchReports() {
    try {
      const response = await fetch(
        `/api/fetchInterviewReports?admin_email=${user.primaryEmailAddress.emailAddress}`
      );
      const data = await response.json();
      console.log(data);
      setReports(data);
      setFilteredReports(data);
      console.log(data);

      // Build job filter options from fetched data
      const uniqueJobs = Array.from(new Set(data.map((r) => r.job_id)));
      const options = uniqueJobs.map((jobId) => ({
        value: jobId,
        label: `Job ${jobId} - ${data.find((r) => r.job_id === jobId)?.job_title || ""}`,
      }));
      setJobOptions(options);
    } catch (err) {
      console.error(err);
    }
  }

  // Apply filters whenever any filter value changes
  useEffect(() => {
    let filtered = [...reports];
    if (selectedJob) {
      filtered = filtered.filter((r) => r.job_id === selectedJob.value);
    }
    // Filter by overall score
    if (scoreRange.overall.min !== "" || scoreRange.overall.max !== "") {
      filtered = filtered.filter((r) => {
        const overall = Number(r.overall_score);
        const min = Number(scoreRange.overall.min) || 0;
        const max = Number(scoreRange.overall.max) || Infinity;
        return overall >= min && overall <= max;
      });
    }
    // Filter by avg technical score (from details JSON)
    if (techRange.min !== "" || techRange.max !== "") {
      filtered = filtered.filter((r) => {
        const details = parseDetails(r.details);
        const tech = details.scores?.technical || 0;
        const min = Number(techRange.min) || 0;
        const max = Number(techRange.max) || Infinity;
        return tech >= min && tech <= max;
      });
    }
    // Filter by avg behavioral score (from details JSON)
    if (behavRange.min !== "" || behavRange.max !== "") {
      filtered = filtered.filter((r) => {
        const details = parseDetails(r.details);
        const behav = details.scores?.behavioral || 0;
        const min = Number(behavRange.min) || 0;
        const max = Number(behavRange.max) || Infinity;
        return behav >= min && behav <= max;
      });
    }
    setFilteredReports(filtered);
  }, [reports, selectedJob, scoreRange, techRange, behavRange]);

  // Open side panel modal with selected report details
  const openSidePanel = (report) => {
    setSelectedReport(report);
    setSidePanelOpen(true);
  };

  const closeSidePanel = () => {
    setSelectedReport(null);
    setSidePanelOpen(false);
  };

  // Calculate average scores from details JSON
  const getAvgScores = (report) => {
    const details = parseDetails(report.details);
    const scores = details.scores || {};
    return {
      technical: scores.technical || 0,
      behavioral: scores.behavioral || 0,
      problemSolving: scores.problemSolving || 0,
    };
  };

  // Build chart data using the parsed scores
  const getChartData = (report) => {
    const { technical, behavioral, problemSolving } = getAvgScores(report);
    return {
      labels: ["Technical", "Behavioral", "Problem Solving"],
      datasets: [
        {
          label: "Scores",
          data: [technical, behavioral, problemSolving],
          backgroundColor: ["#4CAF50", "#2196F3", "#FFC107"],
        },
      ],
    };
  };

  // Handle individual candidate selection action
  async function handleCandidateAction(candidateId, jobId, action) {
    try {
      const response = await fetch("/api/updateSelection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: candidateId,
          job_id: jobId,
          status: action,
          admin_email: user.primaryEmailAddress.emailAddress,
        }),
      });
      if (response.ok) {
        alert(`Candidate ${action} successfully and email sent!`);
        setSelectionStatus((prev) => ({ ...prev, [`${candidateId}-${jobId}`]: action }));
      } else {
        alert("Failed to update selection.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating selection.");
    }
  }

  // Trigger notification for all candidates at once (if needed)
  async function notifyAllCandidates() {
    try {
      const response = await fetch("/api/notifyAll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectionStatus }),
      });
      if (response.ok) {
        alert("Notification emails sent successfully!");
      } else {
        alert("Failed to send notifications.");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending notifications.");
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8">Interview Reports</h1>

      {/* Filter tags */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block font-medium mb-1">Job ID</label>
          <Select
            options={jobOptions}
            isClearable
            onChange={setSelectedJob}
            placeholder="All Jobs"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Overall Score Range</label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              className="border rounded p-1 w-full"
              value={scoreRange.overall.min}
              onChange={(e) =>
                setScoreRange((prev) => ({
                  ...prev,
                  overall: { ...prev.overall, min: e.target.value },
                }))
              }
            />
            <input
              type="number"
              placeholder="Max"
              className="border rounded p-1 w-full"
              value={scoreRange.overall.max}
              onChange={(e) =>
                setScoreRange((prev) => ({
                  ...prev,
                  overall: { ...prev.overall, max: e.target.value },
                }))
              }
            />
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Avg Technical Score</label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              className="border rounded p-1 w-full"
              value={techRange.min}
              onChange={(e) => setTechRange((prev) => ({ ...prev, min: e.target.value }))}
            />
            <input
              type="number"
              placeholder="Max"
              className="border rounded p-1 w-full"
              value={techRange.max}
              onChange={(e) => setTechRange((prev) => ({ ...prev, max: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Avg Behavioral Score</label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              className="border rounded p-1 w-full"
              value={behavRange.min}
              onChange={(e) => setBehavRange((prev) => ({ ...prev, min: e.target.value }))}
            />
            <input
              type="number"
              placeholder="Max"
              className="border rounded p-1 w-full"
              value={behavRange.max}
              onChange={(e) => setBehavRange((prev) => ({ ...prev, max: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Table of Reports */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">S. No</th>
              <th className="px-4 py-2">Application ID</th>
              <th className="px-4 py-2">Job ID / Title</th>
              <th className="px-4 py-2">Candidate ID / Name</th>
              <th className="px-4 py-2">Overall Score</th>
              <th className="px-4 py-2">Avg Scores (T/B/P)</th>
              <th className="px-4 py-2">View Report</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report, index) => {
              const avg = getAvgScores(report);
              return (
                <tr key={`${report.candidate_id}-${report.job_id}`} className="border-b hover:bg-gray-100">
                  <td className="px-4 py-2 text-center">{index + 1}</td>
                  <td className="px-4 py-2 text-center">{report.application_id}</td>
                  <td className="px-4 py-2">
                    <div>{report.job_id}</div>
                    <div className="text-sm text-gray-600">{report.job_title}</div>
                  </td>
                  <td className="px-4 py-2">
                    <div>{report.candidate_id}</div>
                    <div className="text-sm text-gray-600">{report.name}</div>
                  </td>
                  <td className="px-4 py-2 text-center">{report.overall_score}</td>
                  <td className="px-4 py-2 text-center">
                    {avg.technical} / {avg.behavioral} / {avg.problemSolving}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => openSidePanel(report)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      View Report
                    </button>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() =>
                          handleCandidateAction(report.candidate_id, report.job_id, "Selected")
                        }
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      >
                        Select
                      </button>
                      <button
                        onClick={() =>
                          handleCandidateAction(report.candidate_id, report.job_id, "Rejected")
                        }
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Notify All Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={notifyAllCandidates}
          className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700"
        >
          Notify Selected/Rejected Candidates
        </button>
      </div>

      {/* Side Panel Modal for Report Details */}
      <Modal
        isOpen={sidePanelOpen}
        onRequestClose={closeSidePanel}
        contentLabel="Candidate Report Details"
        className="fixed right-0 top-0 bottom-0 w-full md:w-1/2 bg-white p-6 overflow-y-auto shadow-xl"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        {selectedReport && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedReport.name}'s Report</h2>
              <button onClick={closeSidePanel} className="text-gray-600 hover:text-gray-800">
                Close
              </button>
            </div>
            <div className="space-y-2 mb-4">
              <p>
                <strong>Candidate ID:</strong> {selectedReport.candidate_id}
              </p>
              <p>
                <strong>Email:</strong> {selectedReport.email}
              </p>
              <p>
                <strong>Highest Education:</strong> {selectedReport.highest_education}
              </p>
              <p>
                <strong>College:</strong> {selectedReport.college_name}
              </p>
              <p>
                <strong>Applied On:</strong>{" "}
                {new Date(selectedReport.created_at).toLocaleDateString()}
              </p>
              <p>
                <strong>Overall Score:</strong> {selectedReport.overall_score}
              </p>
            </div>
            {/* Chart */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Score Breakdown</h3>
              <Bar data={getChartData(selectedReport)} />
            </div>
            {/* Conversation Details */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Interview Conversation</h3>
              <div className="max-h-60 overflow-y-auto border p-2 rounded">
                {(() => {
                  const details = parseDetails(selectedReport.details);
                  if (details.conversation && details.conversation.length > 0) {
                    return details.conversation.map((conv, idx) => (
                      <div key={idx} className="mb-2 border-b pb-2">
                        <p className="font-medium">
                          {conv.question.type.toUpperCase()}: {conv.question.content}
                        </p>
                        <p className="ml-2">
                          <strong>Answer:</strong> {conv.answer}
                        </p>
                        <p className="ml-2 text-sm text-gray-600">
                          <strong>Feedback:</strong> {conv.evaluation.feedback}
                        </p>
                      </div>
                    ));
                  } else {
                    return <p>No conversation details available.</p>;
                  }
                })()}
              </div>
            </div>
            {/* Resume & Photo Links */}
           
            <div className="flex space-x-4">
              <button
                onClick={() => setResumePreviewVisible(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                View Resume
              </button>
              <button
                onClick={() => setPhotoPreviewVisible(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                View Photo
              </button>
            </div>

              {resumePreviewVisible && (
                      <ResumePreview
                        resume={selectedReport.resume_link}
                        onClose={() => setResumePreviewVisible(false)}
                      />
                    )}
              
                    {photoPreviewVisible && (
                      <PhotoPreview
                        photoPreview={selectedReport.photo_link}
                        onClose={() => setPhotoPreviewVisible(false)}
                      />
                    )}
            
          </div>
        )}
      </Modal>
    </div>
  );
}
