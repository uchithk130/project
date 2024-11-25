// app/page.js
"use client"
import { useState } from 'react';
import { useRouter } from "next/navigation";
import ProctoringWidget from './components/ProctoringWidget';

export default function Home() {
  const [matchStatus, setMatchStatus] = useState('');
  const router = useRouter();

  const startInterview = () => {
    router.push("/upload");
  };
 
  return (
    <div>
            <ProctoringWidget setMatchStatus={setMatchStatus} />

    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Welcome to Interview Automation</h1>
      <p className="text-lg mb-8 text-center">
        Upload your resume, answer questions, and receive a personalized interview report.
      </p>
      <button
        onClick={startInterview}
        className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-700 transition"
      >
        Start Your Interview
      </button>
    </div>
    </div>
  );
}
