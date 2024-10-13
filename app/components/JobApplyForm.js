"use client";

export default function JobApplyForm({ jobID }) {
  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/apply', {
      method: 'POST',
      body: JSON.stringify({ jobID }),
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();
    console.log(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" value={jobID} />
      <button type="submit">Apply</button>
    </form>
  );
}
