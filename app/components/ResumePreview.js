export default function ResumePreview({ resume, onClose }) {
  // Determine if `resume` is a file or a URL
  const isFile = resume instanceof File;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white w-1/2 h-full p-6 relative overflow-auto transition-transform transform slide-in-from-right">
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          &#10005;
        </button>

        {/* Header */}
        <h3 className="text-xl font-semibold mb-4">Resume Preview</h3>

        {/* PDF Preview */}
        {resume ? (
          <iframe
            src={
              isFile
                ? URL.createObjectURL(resume) // If it's a file, use URL.createObjectURL
                : `https://docs.google.com/gview?url=${resume}&embedded=true` // If it's a URL, use Google Docs Viewer
            }
            className="w-full h-full border border-gray-300 rounded-md"
            title="Resume Preview"
          ></iframe>
        ) : (
          <p className="text-gray-500 text-center mt-20">
            No resume available for preview.
          </p>
        )}
      </div>
    </div>
  );
}
