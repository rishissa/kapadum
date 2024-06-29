import apiGenerator from "../api/permission/services/generator.js";
import Permission from "../api/permission/models/permission.js";
import fs from "fs";

export default async () => {
  let permissionArray = await apiGenerator();
  // console.log(permissionArray);
  // fs.writeFileSync("permissions.json", JSON.stringify(permissionArray));
  const permission = await Permission.bulkCreate(permissionArray, {
    updateOnDuplicate: ["api", "method", "endpoint", "handler"],
  });
  return permission.map((item) => {
    return item.id;
  });
};

export async function staffPermission(sequelize, staffPermission = []) {
  for (const item of staffPermission) {
    await Staff_permission.findOrCreate({
      where: {
        api: item.api,
        method: item.method,
        endpoint: item.endpoint,
        handler: item.handler,
      },
    });
  }
}
