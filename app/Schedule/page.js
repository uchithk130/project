"use client";
import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import ResumePreview from "../components/ResumePreview";
import PhotoPreview from "../components/PhotoPreview";
import DisplayExtractedData from "../components/DisplayExtractData";


const Select = dynamic(() => import('react-select'), { ssr: false });

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import TextField from '@mui/material/TextField';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs'; 
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

export default function JobApplications() {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  const { user } = useUser();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [jobIds, setJobIds] = useState([]);
  const [collegeNames, setCollegeNames] = useState([]);
  const [education, setEducation] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [selectedEducation, setSelectedEducation] = useState([]);
  const [dateOrder, setDateOrder] = useState(""); // "asc" or "desc"
  const [scoreOrder, setScoreOrder] = useState(""); // "asc" or "desc"
  const [scoreRange, setScoreRange] = useState({ from: "", to: "" });
  const [resumePreviewVisible, setResumePreviewVisible] = useState(false);
  const [photoPreviewVisible, setPhotoPreviewVisible] = useState(false);
  const [resume, setResume] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [viewPreviewVisible, setViewPreviewVisible] = useState(false);
  const [extractedData, setExtractedData] = useState("");
  const [selection, setSelection] = useState({}); // Track selection status
  const [rejectAll, setRejectAll] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectionStatus, setSelectionStatus] = useState(""); // "Selected", "Rejected" or ""
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [selectedDateTime, setSelectedDateTime] = useState(dayjs().tz("Asia/Kolkata"));
  const [submittedDateTime, setSubmittedDateTime] = useState("");

  const handleDateTimeChange = (newValue) => {
    if (newValue) {
      setSelectedDateTime(newValue.tz("Asia/Kolkata"));
    }
  };


  // const handleSubmit = () => {
  //   // Format and set the submitted time in IST
  //   const formattedDateTime = selectedDateTime.format('ddd, DD MMM YYYY HH:mm:ss [IST]');
  //   setSubmittedDateTime(formattedDateTime);
  //   alert(formattedDateTime);
  //   console.log(selection);
  //   setShowTimePicker(false);
  // };

  const handleSubmit = async () => {
    // Format and set the submitted time in IST
    const formattedDateTime = selectedDateTime.format('ddd, DD MMM YYYY HH:mm:ss [IST]');
    setSubmittedDateTime(formattedDateTime);

    // Extract emails and job titles of only selected candidates
    const selectedApplications = filteredApplications.filter(app => selection[`${app.candidate_id}-${app.job_id}`] === "Selected");
     
    // Make the API call to schedule the interview, passing date/time and emails
    const response = await fetch('/api/scheduleInterview', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            interviewDateTime: formattedDateTime,
            selectApplications: selectedApplications,
        }),
    });

    if (response.ok) {
        alert('Interview scheduled successfully!');
        console.log('Interview scheduled at:', formattedDateTime);
    } else {
        alert('Failed to schedule interview');
    }

    // Hide the time picker after submission
    setShowTimePicker(false);
};


  useEffect(() => {
    async function fetchApplications() { 
      const response = await fetch(
        `/api/fetchapplications?admin_email=${user.primaryEmailAddress.emailAddress}`
      );
      const data = await response.json();
      console.log(data);
      setApplications(data);
      setFilteredApplications(data);

      // Extract unique job IDs and college names for filtering
      // const uniqueJobIds = Array.from(new Set(data.map((app) => app.job_id)));
      // setJobIds(uniqueJobIds);
      const uniqueJobs = Array.from(
        data.reduce((map, app) => {
          // Add job_id and job_title to the map if job_id is not already present
          if (!map.has(app.job_id)) {
            map.set(app.job_id, app.job_title);
          }
          return map;
        }, new Map())
      );
      
      // Convert the Map to an array of objects with `job_id` and `job_title`
      const jobIdsWithTitles = uniqueJobs.map(([job_id, job_title]) => ({
        job_id,
        job_title,
      }));
      
      setJobIds(jobIdsWithTitles);
      

      const uniqueColleges = Array.from(new Set(data.map((app) => app.college_name)));
      setCollegeNames(uniqueColleges.map((college) => ({ value: college, label: college })));

      const uniqueEducation = Array.from(new Set(data.map((app) => app.highest_education)));
      setEducation(uniqueEducation.map((education) => ({ value: education, label: education })));
    }

    if (user) {
      fetchApplications();
    }
  }, [user]);

  const handleJobIdFilter = (jobId) => {
    setSelectedJobId(jobId);
    filterApplications(jobId, selectedColleges, dateOrder, scoreOrder,scoreRange,selectedEducation);
  };

  const handleCollegeFilter = (colleges) => {
    setSelectedColleges(colleges);
    filterApplications(selectedJobId, colleges, dateOrder, scoreOrder,scoreRange,selectedEducation);
  };

  const handleEducationFilter = (Education) => {
    setSelectedEducation(Education);
    filterApplications(selectedJobId, selectedColleges, dateOrder, scoreOrder,scoreRange,Education);
  };

  const handleDateOrder = (order) => {
    setDateOrder(order);
    filterApplications(selectedJobId, selectedColleges, order, scoreOrder,scoreRange,selectedEducation);
  };

  const handleScoreOrder = (order) => {
    setScoreOrder(order);
    filterApplications(selectedJobId, selectedColleges, dateOrder, order,scoreRange,selectedEducation);
  };

 
const handleScoreRange = (key, value) => {
  const newRange = { ...scoreRange, [key]: value };
  setScoreRange(newRange);
  filterApplications(selectedJobId, selectedColleges, dateOrder, scoreOrder, newRange,selectedEducation);
};


const filterApplications = (jobId, colleges, dateOrder, scoreOrder, scoreRange, selectedEducation, selectionStatus) => {
  let filtered = applications;

  if (jobId) {
    filtered = filtered.filter((app) => app.job_id == jobId);
  }

  if (colleges && colleges.length > 0) {
    const collegeNames = colleges.map((college) => college.value);
    filtered = filtered.filter((app) => collegeNames.includes(app.college_name));
  }

  if (selectedEducation && selectedEducation.length > 0) {
    const education = selectedEducation.map((education) => education.value);
    filtered = filtered.filter((app) => education.includes(app.highest_education));
  }

  if (dateOrder) {
    filtered.sort((a, b) =>
      dateOrder === "asc"
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at)
    );
  }

  if (scoreOrder) {
    filtered.sort((a, b) =>
      scoreOrder === "asc"
        ? a.extracted_data.extractedData.Score - b.extracted_data.extractedData.Score
        : b.extracted_data.extractedData.Score - a.extracted_data.extractedData.Score
    );
  }

  if (scoreRange.from !== "" || scoreRange.to !== "") {
    filtered = filtered.filter((app) => {
      const score = app.extracted_data.extractedData.Score;
      const from = parseFloat(scoreRange.from) || 0;
      const to = parseFloat(scoreRange.to) || 100;
      return score >= from && score <= to;
    });
  }

  if (selectionStatus) {
    filtered = filtered.filter(
      (app) => selection[`${app.candidate_id}-${app.job_id}`] === selectionStatus
    );
  }

  setFilteredApplications(filtered);
};


  const handleSelection = (candidateId, jobId, action) => {
    const key = `${candidateId}-${jobId}`;
    setSelection((prevSelection) => {
      if (prevSelection[key] === action) {
        const updatedSelection = { ...prevSelection };
        delete updatedSelection[key];
        return updatedSelection;
      }
      return { ...prevSelection, [key]: action };
    });
  };

  const handleSelectAll = () => {
    const updatedSelection = { ...selection }; // Create a copy of the current selection
  
    if (!selectAll) {
      // If toggling to "Select All", add all keys
      filteredApplications.forEach((app) => {
        const key = `${app.candidate_id}-${app.job_id}`;
        updatedSelection[key] = "Selected";
      });
    } else {
      // If toggling off "Select All", remove all keys
      filteredApplications.forEach((app) => {
        const key = `${app.candidate_id}-${app.job_id}`;
        delete updatedSelection[key]; // Remove the key from the object
      });
    }
  
    setSelectAll(!selectAll); // Toggle the "selectAll" state
    setSelection(updatedSelection); // Update the selection state
  };
  


  const handleRejectAll = () => {
    const updatedSelection = { ...selection }; // Create a copy of the current selection
  
    if (!rejectAll) {
      // If toggling to "Reject All", add all keys with "Rejected"
      filteredApplications.forEach((app) => {
        const key = `${app.candidate_id}-${app.job_id}`;
        updatedSelection[key] = "Rejected";
      });
    } else {
      // If toggling off "Reject All", remove all keys
      filteredApplications.forEach((app) => {
        const key = `${app.candidate_id}-${app.job_id}`;
        delete updatedSelection[key]; // Remove the key from the object
      });
    }
  
    setRejectAll(!rejectAll); // Toggle the "rejectAll" state
    setSelection(updatedSelection); // Update the selection state
  };
  


  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        Job Applications
      </h1>

      <div className="mb-6 flex justify-end space-x-4">
  {/* Select All Checkbox */}
  <div className="flex items-center">
    <input
      type="checkbox"
      checked={selectAll}
      onChange={handleSelectAll}
      className="mr-2"
    />
    <span className="text-lg font-medium text-gray-700">Select All</span>
  </div>

  {/* Reject All Checkbox */}
  <div className="flex items-center">
    <input
      type="checkbox"
      checked={rejectAll}
      onChange={handleRejectAll}
      className="mr-2"
    />
    <span className="text-lg font-medium text-gray-700">Reject All</span>
  </div>
</div>


      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Job ID Filter */}
  <div>
    <label className="block text-lg font-medium text-gray-700 mb-2">Job ID</label>
    <select
      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={selectedJobId}
      onChange={(e) => handleJobIdFilter(e.target.value)}
    >
      <option value="">All Job IDs</option>
        {jobIds.map((job) => (
          <option key={job.job_id} value={job.job_id}>
            {job.job_id} - {job.job_title}
          </option>
      ))}
    </select>
  </div>

  {/* College Filter */}
  <div>
    <label className="block text-lg font-medium text-gray-700 mb-2">College</label>
    <Select
      options={collegeNames}
      isMulti
      value={selectedColleges}
      onChange={handleCollegeFilter}
      placeholder="Filter by College"
      className="basic-multi-select"
      instanceId="react-select-instance"
    />
  </div>

  <div>
    <label className="block text-lg font-medium text-gray-700 mb-2">Education</label>
    <Select
      options={education}
      isMulti
      value={selectedEducation}
      onChange={handleEducationFilter}
      placeholder="Filter by Education"
      className="basic-multi-select"
      instanceId="react-select-instance"
    />
  </div>

  {/* Date Sorting Filter */}
  <div>
    <label className="block text-lg font-medium text-gray-700 mb-2">Sort by Date</label>
    <select
      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={dateOrder}
      onChange={(e) => handleDateOrder(e.target.value)}
    >
      <option value="">Select Date Order</option>
      <option value="asc">Ascending</option>
      <option value="desc">Descending</option>
    </select>
  </div>

  {/* Score Sorting Filter */}
  <div>
    <label className="block text-lg font-medium text-gray-700 mb-2">Sort by Score</label>
    <select
      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={scoreOrder}
      onChange={(e) => handleScoreOrder(e.target.value)}
    >
      <option value="">Select Score Order</option>
      <option value="asc">Ascending</option>
      <option value="desc">Descending</option>
    </select>
  </div>

  <div>
  <label className="block text-lg font-medium text-gray-700 mb-2">Selection Status</label>
  <select
    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={selectionStatus}
    onChange={(e) => {
      setSelectionStatus(e.target.value);
      filterApplications(selectedJobId, selectedColleges, dateOrder, scoreOrder, scoreRange, selectedEducation, e.target.value);
    }}
  >
    <option value="">All Candidates</option>
    <option value="Selected">Selected</option>
    <option value="Rejected">Rejected</option>
  </select>
</div>


  {/* Score Range Filter */}
  <div>
    <label className="block text-lg font-medium text-gray-700 mb-2">Score Range</label>
    <div className="flex space-x-4">
      <input
        type="number"
        placeholder="From"
        value={scoreRange.from}
        onChange={(e) => handleScoreRange("from", e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="number"
        placeholder="To"
        value={scoreRange.to}
        onChange={(e) => handleScoreRange("to", e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>
</div>

      {filteredApplications.length === 0 ? (
        <p className="text-center text-lg text-gray-600">Loading...</p>
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
                <th className="px-6 py-4 text-center font-semibold">Details</th>
                <th className="px-6 py-4 text-center font-semibold">Score</th>
                <th className="px-6 py-4 text-center font-semibold">Select/Reject</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application, index) => (
                <tr
                  key={`${application.candidate_id}-${application.job_id}`}
                  className="border-b hover:bg-gray-100"
                >
                  <td className="px-6 py-4 text-gray-700">{index + 1}</td>
                  <td className="px-6 py-4 text-gray-700">{application.job_id}</td>
                  <td className="px-6 py-4 text-gray-700">{application.candidate_id}</td>
                  <td className="px-6 py-4 text-gray-700">{application.name}</td>
                  <td className="px-6 py-4 text-gray-700">{application.highest_education}</td>
                  <td className="px-6 py-4 text-gray-700">{application.college_name}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {new Date(application.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        setExtractedData(application.extracted_data);
                        setResume(application.resume);
                        setPhoto(application.photo);
                        setViewPreviewVisible(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium transition"
                    >
                      View details
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {application.extracted_data?.extractedData?.Score}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center space-x-4">
                      {selection[`${application.candidate_id}-${application.job_id}`] ===
                      "Selected" ? (
                        <button
                          onClick={() =>
                            handleSelection(application.candidate_id, application.job_id, "Selected")
                          }
                          className="bg-green-500 text-white px-5 py-2 rounded-full shadow-lg hover:bg-green-600 transition transform hover:scale-105 focus:ring-2 focus:ring-green-300 focus:outline-none"
                        >
                          Selected
                        </button>
                      ) : selection[`${application.candidate_id}-${application.job_id}`] ===
                        "Rejected" ? (
                        <button
                          onClick={() =>
                            handleSelection(application.candidate_id, application.job_id, "Rejected")
                          }
                          className="bg-red-500 text-white px-5 py-2 rounded-full shadow-lg hover:bg-red-600 transition transform hover:scale-105 focus:ring-2 focus:ring-red-300 focus:outline-none"
                        >
                          Rejected
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              handleSelection(application.candidate_id, application.job_id, "Selected")
                            }
                            className="border-2 border-green-500 text-green-500 px-5 py-2 rounded-full shadow-lg hover:bg-green-500 hover:text-white transition transform hover:scale-105 focus:ring-2 focus:ring-green-300 focus:outline-none"
                          >
                            Select
                          </button>
                          <button
                            onClick={() =>
                              handleSelection(application.candidate_id, application.job_id, "Rejected")
                            }
                            className="border-2 border-red-500 text-red-500 px-5 py-2 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition transform hover:scale-105 focus:ring-2 focus:ring-red-300 focus:outline-none"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center mt-6">
        <button
          onClick={() => setShowTimePicker(true)}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition transform hover:scale-105 focus:ring-2 focus:ring-blue-300 focus:outline-none"
        >
          Schedule Interview
        </button>
      </div>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96 max-w-md">
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">Select Interview Time</h2>
            <div className="flex justify-center">

            <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          label="Select Date and Time"
          onChange={handleDateTimeChange}
          value={selectedDateTime}
          renderInput={(params) => <TextField {...params} />}
          PopperProps={{
            disablePortal: true,
          }}
          minDate={dayjs().tz("Asia/Kolkata")} // Prevent selecting past dates
          sx={{
            '& .MuiInputBase-root': {
              padding: '8px',
            },
          }}
        />
      </LocalizationProvider>
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowTimePicker(false)}
                className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      )}

      {resumePreviewVisible && (
        <ResumePreview resume={resume} onClose={() => setResumePreviewVisible(false)} />
      )}

      {photoPreviewVisible && (
        <PhotoPreview photoPreview={photo} onClose={() => setPhotoPreviewVisible(false)} />
      )}

      {viewPreviewVisible && (
        <DisplayExtractedData
          extractedData={extractedData.extractedData}
          resumeUrl={resume}
          photoUrl={photo}
          onClose={() => setViewPreviewVisible(false)}
        />
      )}
    </div>
  );
}
