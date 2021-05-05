const { Pool } = require('pg');
const connectionString = "postgres://postgres:postgres@localhost:5432/sharehome";

//connect to database
const pool = new Pool({
  connectionString:connectionString,
  // user:"admin",
  // password:"password",
  max:1,
  idleTimeoutMillis:30000,
  connectionTimeoutMillis:2000,
});

//export query function
module.exports = {
  query: (text, params) => {
    console.log("Running database query - " + text.split(" ")[0]);
    return pool.query(text, params);
  },
};
