import apiGenerator from "./apiGenerator.js";
// import sequelize from "../../database/index.js";
import * as relation from "../utils/relation.js";
import initalizeApp from "./initalizeApp.js";
export default async () => {
  console.log("Intializing Server🚀");
  console.log("Setting Up Configuration📤");
  await apiGenerator();
  await initalizeApp();
  console.log("App has been initialized");
  console.log("Server Started!💻");
  console.log(
    `╔═════════════════════════════════════════╗\n║ Server Running On http://localhost:4500 ║\n╚═════════════════════════════════════════╝`
  );
};
