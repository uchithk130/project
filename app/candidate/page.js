"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { UserIcon } from '@heroicons/react/outline';
import { ClipLoader } from "react-spinners"; // Import ClipLoader from react-spinners

export default function CandidateRegistration() {
  const router = useRouter();
  const [candidateName, setCandidateName] = useState('');
  const [email, setEmail] =  useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [resume, setResume] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [skills, setSkills] = useState('');
  const [highestEducation, setHighestEducation] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [address, setAddress] = useState('');
  const [interestDomains, setInterestDomains] = useState('');
  const [loading, setLoading] = useState(false); // New state for loader

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]); 
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start the loader

    const loadingToast = toast.loading("Registering candidate...");

    try {
      const resumeBase64 = resume ? await fileToBase64(resume) : null;
      const photoBase64 = photo ? await fileToBase64(photo) : null;

      const payload = {
        candidateName,
        email,
        password,
        company,
        resume: resumeBase64,
        resumeName: resume?.name,
        resumeType: resume?.type,
        photo: photoBase64,
        photoName: photo?.name,
        photoType: photo?.type,
        skills,
        highestEducation,
        collegeName,
        address,
        interestDomains,
      };

      const response = await fetch("/api/candidate/", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Candidate registered successfully!", { id: loadingToast });

        setCandidateName('');
        setEmail('');
        setPassword('');
        setCompany('');
        setResume(null);
        setPhoto(null);
        setSkills('');
        setHighestEducation('');
        setCollegeName('');
        setAddress('');
        setInterestDomains('');
        router.push("/success");
      } else {
        toast.error(`Failed to register candidate: ${result.error}`, { id: loadingToast });
        router.push("/failure");
      }
    } catch (error) {
      toast.error("An unexpected error occurred!", { id: loadingToast });
    } finally {
      setLoading(false); // Stop the loader
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-4xl font-bold text-gray-700 mb-6 text-center">
          <UserIcon className="h-8 w-8 inline-block text-blue-500 mr-2" />
          Candidate Registration
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-wrap -mx-4">
            <div className="flex-1 px-4">
              <label className="block text-lg font-medium text-gray-600 mb-1">Candidate Name</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                required
                placeholder="Enter your name"
                className="w-full py-3 pl-4 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div className="flex-1 px-4">
              <label className="block text-lg font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full py-3 pl-4 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-4">
            <div className="flex-1 px-4">
              <label className="block text-lg font-medium text-gray-600 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full py-3 pl-4 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div className="flex-1 px-4">
              <label className="block text-lg font-medium text-gray-600 mb-1">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                placeholder="Enter your company"
                className="w-full py-3 pl-4 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div> 

          <div className="flex flex-wrap -mx-4">
            <div className="flex-1 px-4">
              <label className="block text-lg font-medium text-gray-600 mb-1">Upload Resume</label>
              <input
                type="file"
                accept=".pdf, .doc, .docx"
                onChange={(e) => setResume(e.target.files[0])}
                required
                className="w-full py-3 pl-4 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div className="flex-1 px-4">
              <label className="block text-lg font-medium text-gray-600 mb-1">Upload Photo</label>
              <input
                type="file"
                accept=".jpg, .jpeg, .png"
                onChange={(e) => setPhoto(e.target.files[0])}
                required
                className="w-full py-3 pl-4 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-4">
            <div className="flex-1 px-4">
              <label className="block text-lg font-medium text-gray-600 mb-1">Skills</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                required
                placeholder="Enter your skills"
                className="w-full py-3 pl-4 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div className="flex-1 px-4">
              <label className="block text-lg font-medium text-gray-600 mb-1">Highest Education</label>
              <input
                type="text"
                value={highestEducation}
                onChange={(e) => setHighestEducation(e.target.value)}
                required
                placeholder="Enter highest education"
                className="w-full py-3 pl-4 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-4">
            <div className="flex-1 px-4">
              <label className="block text-lg font-medium text-gray-600 mb-1">College Name</label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                required
                placeholder="Enter college name"
                className="w-full py-3 pl-4 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div className="flex-1 px-4">
              <label className="block text-lg font-medium text-gray-600 mb-1">Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                placeholder="Enter your address"
                className="w-full py-3 pl-4 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-4">
            <div className="w-full px-4">
              <label className="block text-lg font-medium text-gray-600 mb-1">Interest Domains</label>
              <input
                type="text"
                value={interestDomains}
                onChange={(e) => setInterestDomains(e.target.value)}
                required
                placeholder="Enter your interest domains"
                className="w-full py-3 pl-4 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
              disabled={loading} // Disable button when loading
            >
              {loading ? <ClipLoader color="#fff" size={25} /> : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
