
"use client";
import { useRouter } from "next/navigation"; // Import useRouter
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
 
export default function CandidateInterviews() {
  const router = useRouter(); // Initialize useRouter
  const { user } = useUser();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const candidateEmail = user?.primaryEmailAddress?.emailAddress;

  useEffect(() => {
    if (!candidateEmail) return; // Wait until the email is available

    const fetchInterviews = async () => {
      try {
        const response = await fetch(`/api/candidateInterviews?email=${candidateEmail}`);
        const data = await response.json();
        setInterviews(data);
        console.log(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching interviews:", error);
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [candidateEmail]);

  if (loading) {
    return <div className="text-center text-lg font-medium">Loading...</div>;
  }

  const startInterview = (id) => {
    router.push(`/start-interview?id=${id}`); // Navigate to the start-interview page
  };

  const requestReschedule = (id) => {
    console.log("Requesting reschedule for:", id);
    // Open a modal or perform the reschedule action
  };

  return (
    <div className="min-h-screen bg-[#effeff]">
      <div className="container mx-auto p-6">
        <h1 className="text-5xl font-extrabold text-center text-[#00796b] mb-8">My Interviews</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.length > 0 ? (
            interviews.map((interview) => (
              <div
                key={interview.interview_id}
                className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{interview.job_title}</h2>
                <p className="text-gray-600 mb-1">
                  <strong>Company:</strong> {interview.company}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Start Time:</strong> {new Date(interview.schedule_time).toLocaleString()}
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>Time Remaining:</strong>{" "}
                  <CountdownTimer scheduleTime={interview.schedule_time} />
                </p>
                <div className="flex justify-between">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    onClick={() => startInterview(interview.application_id)}
                  >
                    Start Interview
                  </button>
                  <button
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-200"
                    onClick={() => requestReschedule(interview.interview_id)}
                  >
                    Request Reschedule
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-600 text-lg font-medium col-span-3">
              No interviews scheduled.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Countdown Timer Component
const CountdownTimer = ({ scheduleTime }) => {
  const [remainingTime, setRemainingTime] = useState(calculateRemainingTime(scheduleTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(calculateRemainingTime(scheduleTime));
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, [scheduleTime]);

  if (!remainingTime) {
    return <span className="text-red-500 font-bold">Interview expired</span>;
  }

  const { days, hours, minutes, seconds } = remainingTime;

  return (
    <span className="text-blue-600 font-semibold">
      {days}d {hours}h {minutes}m {seconds}s
    </span>
  );
};

// Helper to calculate remaining time
const calculateRemainingTime = (scheduleTime) => {
  const scheduleDate = new Date(scheduleTime);
  const now = new Date();

  const difference = scheduleDate - now;

  if (difference <= 0) return null; // Interview started or expired

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
};
  