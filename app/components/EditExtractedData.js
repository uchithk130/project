
import React, { useState, useEffect } from "react";
import ResumePreview from "../components/ResumePreview";
import PhotoPreview from "../components/PhotoPreview";
export default function EditExtractedData({
  extractedData,
  resumeUrl,
  photoUrl ,
  email ,
  jobId ,
  onClose,
  onSuccess,
  onFailure

}) {
  const [localData, setLocalData] = useState(extractedData);
  const [loading, setLoading] = useState(false);
  const [resumePreviewVisible, setResumePreviewVisible] = useState(false); 
  const [photoPreviewVisible, setPhotoPreviewVisible] = useState(false); 
  
  useEffect(() => {

    
    setLocalData(extractedData);

  }, [extractedData]);

  const handleInputChange = (key, value) => {
    setLocalData({
      ...localData,
      extractedData: {
        ...localData.extractedData,
        [key]: value,
      },
    });
  };
  
  const handleArrayChange = (key, index, field, value) => {
    const updatedArray = [...localData.extractedData[key]];
    updatedArray[index][field] = value;
  
    setLocalData({
      ...localData,
      extractedData: {
        ...localData.extractedData,
        [key]: updatedArray,
      },
    });
  };
  

  const handleSimpleArrayChange = (key, index, value) => {
    const updatedArray = [...localData.extractedData[key]];
    updatedArray[index] = value;
    setLocalData({
      ...localData,
      extractedData: {
        ...localData.extractedData,
        [key]: updatedArray,
      },
    });
  };
  

  const addArrayItem = (key, defaultItem) => {
    setLocalData({
      ...localData,
      extractedData: {
        ...localData.extractedData,
        [key]: [...(localData.extractedData[key] || []), defaultItem],
      },
    });
  };
  

  const handleApply = async () => {
    setLoading(true);
   
    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          jobId: jobId,
          resumeUrl : resumeUrl,
          photoUrl : photoUrl,
          extractedData : localData,
        }),
      });
  
      if (!response.ok) throw new Error("Failed to apply for job.");
      onSuccess("Application submitted successfully!");
    } catch (error) {
      console.error("Error applying for job:", error);
      onFailure("Failed to submit the application. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  


  if (
    !localData || 
    !localData.extractedData
  ) {
    console.log("Invalid data structure:", localData);
    return <h1>jiu..</h1>;
  }
  


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
       {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <img src="\Hourglass.gif" alt="Loading..." className="w-16 h-16" />
        </div>
      )}
    

      <div className="bg-white w-2/3 h-full p-6 relative overflow-auto transition-transform transform slide-in-from-right">
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          &#10005;
        </button>

        {/* Header */}
        <h3 className="text-xl font-semibold mb-6">Edit Extracted Data</h3>

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
          <tr className="mb-4">
            <td className="text-left px-4 py-2 border-b font-medium">Name</td>
            <td className="text-left px-4 py-2 border-b">
              <input
                type="text"
                className="w-full border rounded-md px-2 py-1"
                value={localData.extractedData.Name || ""}
                onChange={(e) => handleInputChange("Name", e.target.value)}
              />
            </td>
          </tr>

          {/* Email */}
          <tr className="mb-4">
            <td className="text-left px-4 py-2 border-b font-medium">Email</td>
            <td className="text-left px-4 py-2 border-b">
              <input
                type="email"
                className="w-full border rounded-md px-2 py-1"
                value={localData.extractedData.Email || ""}
                onChange={(e) => handleInputChange("Email", e.target.value)}
              />
            </td>
          </tr>

          {/* Phone */}
          <tr className="mb-4">
            <td className="text-left px-4 py-2 border-b font-medium">Phone</td>
            <td className="text-left px-4 py-2 border-b">
              <input
                type="text"
                className="w-full border rounded-md px-2 py-1"
                value={localData.extractedData.Phone || ""}
                onChange={(e) => handleInputChange("Phone", e.target.value)}
              />
            </td>
          </tr>

          {/* Experience */}
          {/* Experience */}
          <tr className="mb-4">
            <td className="text-left px-4 py-2 border-b font-medium">Experience</td>
            <td className="text-left px-4 py-2 border-b">
              {localData.extractedData.Experience?.map((exp, index) => (
                <div key={index} className="mb-4 border p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left Column (Headings) */}
                    <div className="flex flex-col">
                      <div className="w-full mb-2 rounded-md px-2 py-1 font-medium">Company Name</div>
                      <div className="w-full mb-2 rounded-md px-2 py-1 font-medium">Role</div>
                      <div className="w-full h-40 mb-2 rounded-md px-2 py-1 font-medium">Description</div>
                      <div className="w-full mb-2 rounded-md px-2 py-1 font-medium">Tech Stack</div>
                    </div>

                    {/* Right Column (Values) */}
                    <div className="flex flex-col space-y-2">
                      <input
                        type="text"
                        placeholder="Company Name"
                        className="w-full border rounded-md px-2 py-1"
                        value={exp.Company || ""}
                        onChange={(e) =>
                          handleArrayChange("Experience", index, "Company", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        placeholder="Role"
                        className="w-full border rounded-md px-2 py-1"
                        value={exp.Title || ""}
                        onChange={(e) =>
                          handleArrayChange("Experience", index, "Title", e.target.value)
                        }
                      />
                      <textarea
                        placeholder="Description"
                        className="w-full h-40 border rounded-md px-2 py-1"
                        value={exp.Description || ""}
                        onChange={(e) =>
                          handleArrayChange("Experience", index, "Description", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        placeholder="Tech Stack"
                        className="w-full border rounded-md px-2 py-1"
                        value={exp.TechStack || ""}
                        onChange={(e) =>
                          handleArrayChange("Experience", index, "TechStack", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() =>
                  addArrayItem("Experience", {
                    Company: "",
                    Title: "",
                    Description: "",
                    TechStack: "",
                  })
                }
                className="bg-blue-500 text-white rounded-md px-4 py-2"
              >
                Add Experience
              </button>
            </td>
          </tr>


          {/* Education */}
          {/* Education */}
          <tr className="mb-4">
            <td className="text-left px-4 py-2 border-b font-medium">Education</td>
            <td className="text-left px-4 py-2 border-b">
              {localData.extractedData.Education?.map((edu, index) => (
                <div key={index} className="mb-4 border p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left Column (Headings) */}
                    <div>
                      <div className="w-full mb-2 rounded-md px-2 py-1 font-medium">Institution</div>
                      <div className="w-full mb-2 rounded-md px-2 py-1 font-medium">Degree</div>
                      <div className="w-full mb-2 rounded-md px-2 py-1 font-medium">CGPA</div>
                    </div>

                    {/* Right Column (Values) */}
                    <div>
                      <input
                        type="text"
                        placeholder="Institution"
                        className="w-full mb-2 border rounded-md px-2 py-1"
                        value={edu.Institution || ""}
                        onChange={(e) =>
                          handleArrayChange("Education", index, "Institution", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        placeholder="Degree"
                        className="w-full mb-2 border rounded-md px-2 py-1"
                        value={edu.Degree || ""}
                        onChange={(e) =>
                          handleArrayChange("Education", index, "Degree", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        placeholder="CGPA"
                        className="w-full border rounded-md px-2 py-1"
                        value={edu.CGPA || ""}
                        onChange={(e) =>
                          handleArrayChange("Education", index, "CGPA", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() =>
                  addArrayItem("Education", { Institution: "", Degree: "", CGPA: "" })
                }
                className="bg-blue-500 text-white rounded-md px-4 py-2"
              >
                Add Education
              </button>
            </td>
          </tr>

        {/* Skills */}
         {/* Skills */}
         <tr className="mb-4">
              <td className="text-left px-4 py-2 border-b font-medium">Skills</td>
              <td className="text-left px-4 py-2 border-b">
                <div className="grid grid-cols-4 gap-4">
                  {localData.extractedData.Skills?.map((skill, index) => (
                    <div key={index} className="mb-2">
                      <input
                        type="text"
                        className="w-full border rounded-md px-2 py-1"
                        value={skill}
                        onChange={(e) =>
                          handleSimpleArrayChange("Skills", index, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => addArrayItem("Skills", "")}
                  className="bg-blue-500 text-white rounded-md px-4 py-2 mt-4"
                >
                  Add Skill
                </button>
              </td>
            </tr>


          {/* Projects */}
          <tr className="mb-4">
          <td className="text-left px-4 py-2 border-b font-medium">Projects</td>
          <td className="text-left px-4 py-2 border-b">
            {localData.extractedData.Projects?.map((project, index) => (
              <div key={index} className="mb-4 border p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Column (Headings) */}
                  <div>
                    <div className="w-full mb-2 rounded-md px-2 py-1 font-medium">Project Name</div>
                    <div className="w-full mb-2 rounded-md px-2 py-1 font-medium">Technologies</div>
                    <div className="w-full mb-2 rounded-md px-2 py-1 font-medium">Description</div>
                  </div>

                  {/* Right Column (Values) */}
                  <div>
                    <input
                      type="text"
                      placeholder="Project Name"
                      className="w-full mb-2 border rounded-md px-2 py-1"
                      value={project.Name || ""}
                      onChange={(e) =>
                        handleArrayChange("Projects", index, "Name", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      placeholder="Technologies"
                      className="w-full mb-2 border rounded-md px-2 py-1"
                      value={project.Technologies || ""}
                      onChange={(e) =>
                        handleArrayChange("Projects", index, "Technologies", e.target.value)
                      }
                    />
                    <textarea
                      placeholder="Description"
                      className="w-full h-32 border rounded-md px-2 py-1"
                      value={project.Description || ""}
                      onChange={(e) =>
                        handleArrayChange("Projects", index, "Description", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() =>
                addArrayItem("Projects", {
                  Name: "",
                  Technologies: "",
                  Description: "",
                })
              }
              className="bg-blue-500 text-white rounded-md px-4 py-2"
            >
              Add Project
            </button>
          </td>
        </tr>
        {/* Achievements */}
       
          <tr className="mb-4">
             <td className="text-left px-4 py-2 border-b font-medium">Achievements</td>
            <td className="text-left px-4 py-2 border-b">
              {localData.extractedData.Achievements?.map((achievement, index) => (
                <div key={index} className="mb-4 border p-4 rounded-md">
                  <textarea
                    type="text"
                    className="w-full h-32 border rounded-md px-2 py-1"
                    value={achievement || ""}
                    onChange={(e) => handleSimpleArrayChange("Achievements", index, e.target.value)}
                  />
                </div>
              ))}
              <button
                onClick={() => addArrayItem("Achievements", "")}
                className="bg-blue-500 text-white rounded-md px-4 py-2"
              >
                Add Achievement
              </button>
            </td>
          </tr>


        </table>

        {/* Save Button */}
        <button
           onClick={() => handleApply(localData)}
          className="bg-green-600 text-white rounded-md px-4 py-2 mt-6"
        >
          Save Changes
        </button>

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


