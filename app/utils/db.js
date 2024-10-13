// db.js
import mysql from 'mysql2/promise';
const connection = mysql.createPool({
    host: 'database.ct2q28egejfp.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'UchithKumar1233?',
    database: 'interview_automation',
    port: 3306,
    connectTimeout: 30000, // Increase timeout to 30 seconds
  });
  

export default connection;
