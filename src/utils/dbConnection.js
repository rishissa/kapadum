// import { Sequelize } from "sequelize";
// import { getConfigs } from "./getConnectionConfig.js"; // Import the function you created earlier
// import dbCache from "./dbCache.js";
// // import relation from "./relation.js";
// import mainDbRelation from "./mainDbRelation.js";
// import dbConfig from "../../config/db.config.js";
// import apiGenerator from "./apiGenerator.js";

// export default async (subdomain) => {
//   if (subdomain === null) {
//     if (dbCache.get("main_instance")) {
//       console.log("getting main instance from cache");
//       return dbCache.get("main_instance");
//     } else {
//       console.log("creating main instance ");
//       const mainDb = {};
//       const sequelize = new Sequelize(dbConfig);
//       mainDb.sequelize = await mainDbRelation(sequelize);
//       dbCache.set("main_instance", mainDb.sequelize);
//       await mainDb.sequelize.sync({ alter: true });
//       return mainDb.sequelize;
//     }
//   } else {
//     if (dbCache.get(subdomain) !== undefined) {
//       console.log("getting subd instance from cache");
//       const sequelize = dbCache.get(subdomain);
//       return sequelize;
//     } else {
//       console.log("creating subd instance ");
//       const db = {};
//       const sequelize = new Sequelize(dbConfig);

//       const config = await getConfigs(subdomain, sequelize);

//       if (config === null) return false;
//       else {
//         const sequelize = new Sequelize({
//           dialect: dbConfig.dialect,
//           host: dbConfig.host,
//           port: dbConfig.port,
//           username: dbConfig.username,
//           password: dbConfig.password,
//           database: config.database,
//           pool: dbConfig.pool,
//           logging: dbConfig.logging,
//         });
//         // db.sequelize = await relation(sequelize);
//         dbCache.set(subdomain, db.sequelize);
//         // await db.sequelize.sync({ alter: true });
//         await apiGenerator(db.sequelize); // only for development
//         return db.sequelize;
//       }
//     }
//   }
// };
