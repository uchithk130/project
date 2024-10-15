// app/success/page.js
"use client";


export default function SuccessPage() {




  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-green-500">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="mt-8 text-2xl font-semibold text-gray-700">
          Registration Successful!
        </h2>
      </div>
    </div>
  );
}
