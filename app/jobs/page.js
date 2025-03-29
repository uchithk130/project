"use client";
import { useState, useEffect,useRef } from "react";
import { format } from "date-fns";
import AnimationPopup from "../components/AnimationPopup";
import JobDetails from "../components/JobDetails";
import ResumePreview from "../components/ResumePreview";
import PhotoPreview from "../components/PhotoPreview";
import EditExtractedData from "../components/EditExtractedData";

import { useUser } from "@clerk/nextjs";

export default function Jobs() {
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [showActive, setShowActive] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [candidateEmail,setCandidateEmail]=useState("");
  const [animationVisible, setAnimationVisible] = useState(false);
  const [animationMessage, setAnimationMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [Load, setLoad] = useState(false);
  const [resume, setResume] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const [resumeUrl,setResumeUrl] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [photoUrl,setPhotoUrl] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showJobDetailsPopup, setShowJobDetailsPopup] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [resumePreviewVisible, setResumePreviewVisible] = useState(false); 
  const [photoPreviewVisible, setPhotoPreviewVisible] = useState(false); 
  const [editPreviewVisible, setEditPreviewVisible] = useState(false); 
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState("");
  const [extractedData, setExtractedData] = useState("");
  const [showEditPopup, setShowEditPopup] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoad(true);
        const response = await fetch("/api/jobs");
        const data = await response.json();
        setJobs(data);
        setFilteredJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoad(false);
      }
    }
    fetchJobs();
  }, []);

  const startCamera = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
         
            videoRef.current.srcObject = stream;
            setCameraEnabled(true);
          
        })
        .catch((error) => {
          alert("Error accessing the camera.",error);
          console.error("Error accessing the camera:", error);
          setCameraEnabled(false);
        });
    } else {
      alert("Your browser doesn't support camera access.");
      setCameraEnabled(false);
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas?.getContext("2d");
  
    if (video && canvas && context) {
      // Capture the current frame from the video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Capture the photo as a data URL
      const dataUrl = canvas.toDataURL("image/jpeg");
  
      const uniquePhotoName = `photo_${Date.now()}`;
      setPhotoName(uniquePhotoName);
      setCapturedPhoto(dataUrl);  // Store the captured photo
      setPhotoPreview(dataUrl);  // Show the photo preview
      // Handle the captured image data as needed
  
      // Pause the video stream
      video.pause();  // Pause video playback
  
      // Optionally stop the video stream to release the camera
      const stream = video.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());  // Stop each track of the stream
      }
    }
  };
  
  
  
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
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };


 


  const handleUpload = async () => {
    setCameraEnabled(false);
    if (!user?.primaryEmailAddress?.emailAddress) {
      alert("User not authenticated");
      return;
    }
  
    if (!resume || !capturedPhoto) {
      alert("Please upload both resume and photo.");
      return; 
    }
  
    const resumeBase64 = resume ? await fileToBase64(resume) : null;
    const photoBase64 = capturedPhoto.split(",")[1]; 
    const candidateEmail = user.primaryEmailAddress.emailAddress;
    const jobId = selectedJob?.job_id;
    setLoading(true);
    console.log(jobId)
  
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId : jobId,
          resumeBase64: resumeBase64,
          resumeName: resumeName,
          photoBase64: photoBase64,
          photoName: photoName,
        }),
      });
  
      if (!response.ok) throw new Error("Failed to apply for job.");
      const data = await response.json();
      const extractData = data.extractedData;
      const resumeUrl = data.resumeUrl;
      const photoUrl = data.photoUrl;
      setCandidateEmail(candidateEmail);
      setExtractedData(extractData)
      setResumeUrl(resumeUrl);
      setPhotoUrl(photoUrl);
      setEditPreviewVisible(true);
      setShowPopup(false);
    } catch (error) {
      console.error("Error applying for job:", error);
      setAnimationMessage("Application failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleApplicationSuccess = (message) => {
    setEditPreviewVisible(false);
    setAnimationMessage(message);
    setIsSuccess(true);
    setAnimationVisible(true);
    setTimeout(() => setAnimationVisible(false), 3000);
  };
  
  const handleApplicationFailure = (message) => {
    setEditPreviewVisible(false);
    setAnimationMessage(message);
    setIsSuccess(false);
    setAnimationVisible(true);
    setTimeout(() => setAnimationVisible(false), 3000);
  };
  
 

    if (Load) {
    return (

        <div className="container mx-auto min-h-screen p-10 bg-gradient-to-br from-indigo-50 to-gray-200">
          <h1 className="text-5xl font-bold text-center mb-12 text-indigo-700">Job Listings</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
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
                  setSelectedJob(job);
                  setShowPopup(true);
                }}
                className="text-blue-600 hover:underline transition duration-200"
              >
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>

      {showJobDetailsPopup && (
        <JobDetails
          job={selectedJob}
          onClose={() => setShowJobDetailsPopup(false)}
        />
      )}
          {loading && (
    
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <img src="\Hourglass.gif" alt="Loading..." className="w-16 h-16" />
        </div>

      )}

      {/* Apply Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowPopup(false)}
            >
              &#10005;
            </button>
            <h3 className="text-xl font-semibold mb-4">Take Photo & Upload Resume</h3>

          

            <label className="block text-gray-700 font-semibold mb-1">Upload Resume:</label>
            <div className="flex items-center">
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
              <button
                onClick={() => setResumePreviewVisible(true)}
                className="ml-4 text-blue-600 hover:underline"
              >
                View
              </button>
            </div>

            <label className="block text-gray-700 font-semibold mb-1">Upload Photo:</label>
            <div>
            <video
          ref={videoRef}
          autoPlay
          muted
          style={{
            width: '200px',
            height: '150px',
            border: '2px solid #4A90E2',
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
          }}
        />
        <button onClick={startCamera} className="text-indigo-600 mb-4">
          Start Camera
        </button>
      

      {cameraEnabled && (
        <div>
          <canvas ref={canvasRef} className="hidden"></canvas>
          <button onClick={capturePhoto} className="text-blue-600">
            Capture Photo
          </button>
        </div>
      )}
    </div>


          <button
             onClick={() => {
              handleUpload();
              setShowPopup(false)
            }}
            className={`bg-blue-600 text-white rounded-md px-4 py-2 mt-4 ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}
            disabled={loading} 
            
          >
           {loading ? "Uploading..." : "Upload"}
          </button>

          </div>
        </div>
      )}

          {resumePreviewVisible && (
            <ResumePreview
              resume={resume}
              onClose={() => setResumePreviewVisible(false)}
            />
          )}


      {/* Animation Popup */}
      { editPreviewVisible && (
      <EditExtractedData
        extractedData={extractedData}
        resumeUrl = {resumeUrl}
        photoUrl = {photoUrl}
        email = {candidateEmail}
        jobId =  {selectedJob?.job_id}
        onClose={() => setEditPreviewVisible(false)}
        onSuccess={handleApplicationSuccess}
        onFailure={handleApplicationFailure}
      />
      )}
      {animationVisible && (
        <AnimationPopup
          message={animationMessage}
          isSuccess={isSuccess}
        />
      )}


    </div>
  );
}

