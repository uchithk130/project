// db.js
import mysql from 'mysql2/promise';
const connection = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'interview_automation',
    port: 3306,
    connectTimeout: 30000, // Increase timeout to 30 seconds
  });
  

export default connection;
