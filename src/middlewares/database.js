// middlewares/database.js
const { errorResponse } = require("../services/errorResponse");
const createDbConnection = require("../utils/dbConnection").default;

module.exports = async (req, res, next) => {
  // Access the subdomain from the request object
  const subdomain = req.subdomain;
  const sequelize = await createDbConnection(subdomain);
  if (!sequelize) return res.status(400).send(errorResponse({ message: "Invalid Site Address", details: "Requested subdomain not found" }));
  req.db = sequelize;
  let api = req.url.split("?")[0];
  req.api = api;
  console.log(api);
  next();
};
