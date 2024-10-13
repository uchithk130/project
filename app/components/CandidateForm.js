"use client";

import { useState } from 'react';

export default function CandidateForm() {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [resume, setResume] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('photo', photo);
    formData.append('resume', resume);

    const response = await fetch('/api/candidate', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    console.log(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Name:</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      
      <label>Upload Photo:</label>
      <input type="file" onChange={(e) => setPhoto(e.target.files[0])} required />
      
      <label>Upload Resume:</label>
      <input type="file" onChange={(e) => setResume(e.target.files[0])} required />
      
      <button type="submit">Submit</button>
    </form>
  );
}
