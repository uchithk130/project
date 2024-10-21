// app/failure/page.js
"use client";
import { useSearchParams } from 'next/navigation';

export default function FailurePage() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message');

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-red-500">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h2 className="mt-8 text-2xl font-semibold text-gray-700">
          Registration Failed!
        </h2>
        <p className="mt-4 text-gray-600">
          {errorMessage || "There was an issue registering your account."}
        </p>
      </div>
    </div>
  );
}
