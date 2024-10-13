// /app/api/create-tables/route.js
import connection from '../../utils/db';

export async function GET(req) {
  try {
    // Create tables one by one
    const createCandidatesTable = `
      CREATE TABLE IF NOT EXISTS Candidates (
          candidate_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255),
          email VARCHAR(255),
          resume_url VARCHAR(255),
          education TEXT,
          skills TEXT,
          experience TEXT,
          achievements TEXT
      );
    `;

    const createAdminsTable = `
      CREATE TABLE IF NOT EXISTS Admins (
          admin_id INT AUTO_INCREMENT PRIMARY KEY,
          company VARCHAR(255),
          email VARCHAR(255),
          login_credentials VARCHAR(255),
          job_id INT,
          eligibility_criteria TEXT
      );
    `;

    const createJobsTable = `
      CREATE TABLE IF NOT EXISTS Jobs (
          job_id INT AUTO_INCREMENT PRIMARY KEY,
          job_title VARCHAR(255),
          job_description TEXT,
          eligibility_criteria TEXT
      );
    `;

    const createJobApplicationsTable = `
      CREATE TABLE IF NOT EXISTS JobApplications (
          application_id INT AUTO_INCREMENT PRIMARY KEY,
          candidate_id INT,
          job_id INT,
          FOREIGN KEY (candidate_id) REFERENCES Candidates(candidate_id),
          FOREIGN KEY (job_id) REFERENCES Jobs(job_id)
      );
    `;

    const createInterviewScheduleTable = `
      CREATE TABLE IF NOT EXISTS InterviewSchedule (
          interview_id INT AUTO_INCREMENT PRIMARY KEY,
          job_id INT,
          candidate_id INT,
          schedule_time DATETIME,
          status VARCHAR(50),
          FOREIGN KEY (candidate_id) REFERENCES Candidates(candidate_id),
          FOREIGN KEY (job_id) REFERENCES Jobs(job_id)
      );
    `;

    // Execute each create table query
    await connection.query(createCandidatesTable);
    await connection.query(createAdminsTable);
    await connection.query(createJobsTable);
    await connection.query(createJobApplicationsTable);
    await connection.query(createInterviewScheduleTable);

    return new Response(JSON.stringify({ message: 'Tables created successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
