import React from "react";
import { useEffect, useState } from "react";
import ResumePreview from "../components/ResumePreview";
import PhotoPreview from "../components/PhotoPreview";
export default function DisplayExtractedData({ extractedData, resumeUrl, photoUrl, onClose }) {
    const [resumePreviewVisible, setResumePreviewVisible] = useState(false); 
    const [photoPreviewVisible, setPhotoPreviewVisible] = useState(false);
  if (!extractedData) {
    console.error("Invalid data structure:", extractedData);
    return <h1>No data available.</h1>;
  }
 
  return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
  <div className="bg-white w-2/3 h-full p-6 relative overflow-auto transition-transform transform slide-in-from-right">
    {/* Close Button */}
    <button
      className="fixed top-2 right-2 text-gray-600 hover:text-gray-800 z-50"
      onClick={onClose}
    >
      &#10005;
    </button>
        {/* Header */}
        <h3 className="text-xl font-semibold mb-6 content">View Extracted Data</h3>
 
        {/* Resume and Photo Preview Buttons */}
        <button
            onClick={() => setResumePreviewVisible(true)}
            className="ml-4 text-blue-600 hover:underline"
            >
            Resume
        </button>

        <button
            onClick={() => setPhotoPreviewVisible(true)}
            className="ml-4 text-blue-600 hover:underline"
            >
            Photo
        </button>

        <table className="w-full table-auto border-collapse">
          {/* Name */}
          <tr>
            <td className="text-left px-4 py-2 border-b font-medium">Name</td>
            <td className="text-left px-4 py-2 border-b">
              {extractedData.Name || "N/A"}
            </td>
          </tr>

          {/* Email */}
          <tr>
            <td className="text-left px-4 py-2 border-b font-medium">Email</td>
            <td className="text-left px-4 py-2 border-b">
              {extractedData.Email || "N/A"}
            </td>
          </tr>

          {/* Phone */}
          <tr>
            <td className="text-left px-4 py-2 border-b font-medium">Phone</td>
            <td className="text-left px-4 py-2 border-b">
              {extractedData.Phone || "N/A"}
            </td>
          </tr>

          {/* Experience */}
          <tr className="mb-4">
            <td className="text-left px-4 py-2 border-b font-medium">Experience</td>
            <td className="text-left px-4 py-2 border-b">
                {extractedData.Experience?.map((exp, index) => (
                <div key={index} className="mb-4 border p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                    {/* Left Column (Headings) */}
                    <div className="flex flex-col">
                        <div className="w-full mb-2 rounded-md px-2 py-1 font-medium border-b">Company Name</div>
                        <div className="w-full mb-2 rounded-md px-2 py-1 font-medium border-b">Role</div>
                        <div className="w-full mb-2 rounded-md px-2 py-1 font-medium h-40 border-b">Description</div>
                        <div className="w-full mb-2 rounded-md px-2 py-1 font-medium border-b">Tech Stack</div>
                    </div>

                    {/* Right Column (Values) */}
                    <div className="flex flex-col space-y-2">
                        <div className="w-full  px-2 py-1 border-b">
                        {exp.Company || "N/A"}
                        </div>
                        <div className="w-full d px-2 py-1 border-b">
                        {exp.Title || "N/A"}
                        </div>
                        <div className="w-full h-40  px-2 py-1 overflow-y-auto border-b">
                        {exp.Description || "N/A"}
                        </div>
                        <div className="w-full  px-2 py-1 border-b">
                        {exp.TechStack || "N/A"}
                        </div>
                    </div>
                    </div>
                </div>
                ))}
            </td>
            </tr>


          {/* Education */}
          <tr className="mb-4">
            <td className="text-left px-4 py-2 border-b font-medium">Education</td>
            <td className="text-left px-4 py-2 border-b">
                {extractedData.Education?.map((edu, index) => (
                <div key={index} className="mb-4 border p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                    {/* Left Column (Headings) */}
                    <div className="flex flex-col">
                        <div className="w-full mb-2 rounded-md px-2 py-1 font-medium border-b">Institution</div>
                        <div className="w-full mb-2 rounded-md px-2 py-1 font-medium border-b">Degree</div>
                        <div className="w-full mb-2 rounded-md px-2 py-1 font-medium border-b">CGPA</div>
                    </div>

                    {/* Right Column (Values) */}
                    <div className="flex flex-col space-y-2 ">
                        <div className="w-full  px-2 py-1 border-b">
                        {edu.Institution || "N/A"}
                        </div>
                        <div className="w-full  px-2 py-1 border-b">
                        {edu.Degree || "N/A"}
                        </div>
                        <div className="w-full px-2 py-1 border-b">
                        {edu.CGPA || "N/A"}
                        </div>
                    </div>
                    </div>
                </div>
                ))}
            </td>
            </tr>


          {/* Skills */}
          <tr className="mb-4">
            <td className="text-left px-4 py-2 border-b font-medium">Skills</td>
            <td className="text-left px-4 py-2 border-b">
                <div className="grid grid-cols-4 gap-4">
                {extractedData.Skills?.map((skill, index) => (
                    <div key={index} className="px-2 py-1 border rounded-md text-center">
                    {skill || "N/A"}
                    </div>
                ))}
                </div>
            </td>
        </tr>


          {/* Projects */}
          <tr className="mb-4">
            <td className="text-left px-4 py-2 border-b font-medium">Projects</td>
            <td className="text-left px-4 py-2 border-b">
                {extractedData.Projects?.map((project, index) => (
                <div key={index} className="mb-4 border p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                    {/* Left Column (Headings) */}
                    <div>
                        <div className="w-full mb-2 rounded-md px-2 py-1 font-medium border-b">Project Name</div>
                        <div className="w-full mb-2 rounded-md px-2 py-1 font-medium border-b">Technologies</div>
                        <div className="w-full mb-2 rounded-md px-2 py-1 font-medium border-b">Description</div>
                    </div>

                    {/* Right Column (Values) */}
                    <div>
                        <div className="w-full mb-2 rounded-md px-2 py-1 border-b">{project.Name || "N/A"}</div>
                        <div className="w-full mb-2 rounded-md px-2 py-1 border-b">{project.Technologies || "N/A"}</div>
                        <div className="w-full mb-2 rounded-md px-2 py-1 border-b">{project.Description || "N/A"}</div>
                    </div>
                    </div>
                </div>
                ))}
            </td>
            </tr>



          {/* Achievements */}
          <tr>
            <td className="text-left px-4 py-2 border-b font-medium">Achievements</td>
            <td className="text-left px-4 py-2 border-b">
              {extractedData.Achievements?.map((achievement, index) => (
                <div key={index} className="mb-2 border-b">
                  {achievement}
                </div>
              ))}
            </td>
          </tr>
        </table>
        {resumePreviewVisible && (
            <ResumePreview
                resume={resumeUrl}
                onClose={() => setResumePreviewVisible(false)}
            />
        )}
                
                      {/* Photo Preview */}
        {photoPreviewVisible && (
            <PhotoPreview
                photoPreview={photoUrl}
                onClose={() => setPhotoPreviewVisible(false)}
            />
        )}

        
      </div>
    </div>
  );
}
