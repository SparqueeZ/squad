require("dotenv").config();

const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const address = process.env.DB_ADDRESS;
const port = process.env.DB_PORT;
const dbname = process.env.DB_NAME;
const dbAuthSource = process.env.DB_AUTH_SOURCE;

console.log(address);

module.exports = {
  url: `mongodb://${user}:${password}@${address}:${port}/${dbname}${
    dbAuthSource ? `?authSource=${dbAuthSource}` : ""
  }`,
};
