import { useState } from 'react';

const ResumeUploadModal = ({ onClose, onApply }) => {
  const [resume, setResume] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [resumeType, setResumeType] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoName, setPhotoName] = useState('');
  const [photoType, setPhotoType] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResume(reader.result.split(',')[1]);
        setResumeName(file.name);
        setResumeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result.split(',')[1]);
        setPhotoName(file.name);
        setPhotoType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    onApply(resume, resumeName, resumeType, photo, photoName, photoType);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Upload Resume and Photo</h2>
        
        <div className="mb-4">
          <label className="block mb-1">Resume:</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="border border-gray-300 rounded-md p-2 w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Photo:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="border border-gray-300 rounded-md p-2 w-full"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Submit Application
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md ml-2 hover:bg-gray-400 transition duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeUploadModal;
