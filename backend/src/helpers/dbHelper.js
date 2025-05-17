const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Generic query executor
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } catch (err) {
    console.error('DB QUERY ERROR:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

// CRUD helper functions
const dbHelper = {
  // SELECT * FROM table WHERE conditions
  getAll: async (table, conditions = '', params = []) => {
    const queryText = `SELECT * FROM ${table} ${conditions}`;
    const result = await query(queryText, params);
    return result.rows;
  },

  // SELECT one by ID or condition
  getOne: async (table, conditions = '', params = []) => {
    const queryText = `SELECT * FROM ${table} ${conditions} LIMIT 1`;
    const result = await query(queryText, params);
    return result.rows[0];
  },

  // SELECT columns FROM table WHERE conditions
  getSeletedProperties: async (table, columns, conditions = '', params = []) => {
    const queryText = `SELECT ${columns} FROM ${table} ${conditions}`;
    const result = await query(queryText, params);
    return result.rows;
  },

  // INSERT INTO table(columns) VALUES(values)
  create: async (table, data) => {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');
    const queryText = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result = await query(queryText, values);
    return result.rows[0];
  },

  // UPDATE table SET column = value WHERE conditions
  update: async (table, data, conditions, params = []) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, idx) => `${key} = $${idx + 2}`).join(', ');
    const queryText = `UPDATE ${table} SET ${setClause} ${conditions} RETURNING *`;
    const result = await query(queryText, [...params, ...values]);
    return result.rows[0];
  },

  // DELETE FROM table WHERE conditions
  remove: async (table, conditions, params = []) => {
    const queryText = `DELETE FROM ${table} ${conditions} RETURNING *`;
    const result = await query(queryText, params);
    return result.rows[0];
  },
};

module.exports = dbHelper;
