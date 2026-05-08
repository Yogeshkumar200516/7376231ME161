import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/*
|--------------------------------------------------------------------------
| MySQL Connection Pool
|--------------------------------------------------------------------------
*/

const pool = mysql.createPool({
  host: process.env.DB_HOST,

  user: process.env.DB_USER,

  password: process.env.DB_PASSWORD,

  database: process.env.DB_NAME,

  port: Number(process.env.DB_PORT) || 3306,

  waitForConnections: true,

  connectionLimit: 10,

  queueLimit: 0,

  timezone: '+00:00',
});

/*
|--------------------------------------------------------------------------
| Test Database Connection
|--------------------------------------------------------------------------
*/

export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();

    console.log(`
==================================================
 MySQL Connected Successfully
 Host     : ${process.env.DB_HOST}
 Database : ${process.env.DB_NAME}
==================================================
    `);

    connection.release();
  } catch (error) {
    console.error(`
==================================================
 MySQL Connection Failed
 Error : ${error.message}
==================================================
    `);

    process.exit(1);
  }
};

/*
|--------------------------------------------------------------------------
| Export Pool
|--------------------------------------------------------------------------
*/

export default pool;

