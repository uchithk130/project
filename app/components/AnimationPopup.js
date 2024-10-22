const AnimationPopup = ({ message, isSuccess }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className={`text-xl font-semibold ${isSuccess ? "text-green-500" : "text-red-500"}`}>
          {message}
        </h2>
        <svg
          className={`w-8 h-8 mt-4 ${isSuccess ? "text-green-500 animate-bounce" : "text-red-500 animate-shake"}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isSuccess ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          )}
        </svg>
      </div>
    </div>
  );
};

export default AnimationPopup;
