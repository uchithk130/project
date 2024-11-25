// components/PhotoPreview.js
export default function PhotoPreview({ photoPreview, onClose }) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
        <div className="bg-white w-1/2 h-full p-6 relative overflow-auto transition-transform transform slide-in-from-right">
          <button
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            onClick={onClose}
          >
            &#10005;
          </button>
          <img src={photoPreview} alt="Uploaded" className="max-w-full h-auto" />
        </div>
      </div>
    );
  }
  