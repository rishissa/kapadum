import Role from "../api/role/models/role.js";

export default async (roleName) => {
  const role_data = await Role.findOne({
    where: { name: roleName },
    attributes: ["id"],
  });
  return role_data.id;
};
