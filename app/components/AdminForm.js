"use client";

import { useState } from 'react';

export default function AdminForm() {
  const [jobID, setJobID] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/admin', {
      method: 'POST',
      body: JSON.stringify({ jobID, description }),
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();
    console.log(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Job ID:</label>
      <input type="text" value={jobID} onChange={(e) => setJobID(e.target.value)} required />
      
      <label>Job Description:</label>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
      
      <button type="submit">Add Job</button>
    </form>
  );
}
