import { verify } from "../services/jwt.js";
import dbCache from "../utils/dbCache.js";
import { errorResponse } from "../services/errorResponse.js";
import { Op } from "sequelize";
import User from "../api/user/models/user.js";
import Role from "./../api/role/models/role.js";
import Permission from "./../api/permission/models/permission.js";
import Role_permission from "./../api/permission/models/role_permission.js";

export default async (req, res, next) => {
  try {
    // return next()
    let endpoint = req.endpoint;
    let params = req.params;
    endpoint = Object.entries(params).reduce(
      (str, [key, value]) => str.replace(new RegExp(value, "g"), `:${key}`),
      endpoint
    );

    // +++
    let user, role;
    if (req.headers.authorization) {
      const token = verify(req);
      console.log(token);
      if (token.error) return res.status(400).send({ error: token.error });
      user = await User.findOne({
        where: { id: token.id },
        include: [{ model: Role, as: "role" }],
      });
      if (!user || !user.role) {
        return res.status(403).send(
          errorResponse({
            status: 403,
            name: "ForbiddenError",
            message: "Forbidden",
            details: "You don't have permission to access this route",
          })
        );
      }

      role = user.role;
      res.user = user.id;
      res.user_data = user;
    } else {
      const getrole = await Role.findOne({
        where: { name: "Public" },
      });
      role = getrole;
    }
    // +++

    if (user?.role?.name === "Staff") {
      console.log("Role Is Staff - RBAC");
      const Permission = await Permission.findOne({
        where: [{ endpoint }, { method: req.method }],
      });

      if (!Permission) {
        return res.status(403).send(
          errorResponse({
            status: 403,
            name: "ForbiddenError",
            message: "Forbidden",
            details: "You don't have permission to access this route",
          })
        );
      }

      const User_permission = await User_permission.findOne({
        where: {
          [Op.and]: [
            ,
            // { PermissionId: permission.id }
            { UserId: user.id },
            { PermissionId: Permission.id },
          ],
        },
      });

      if (User_permission) {
        return next();
      } else {
        return res.status(403).send(
          errorResponse({
            status: 403,
            // name: "ForbiddenError",
            message: "Forbidden",
            details: "You don't have permission to access this route",
          })
        );
      }
    } else {
      console.log("Role Is NOT Staff - RBAC");
      console.log(endpoint, req.method);
      const permission = await Permission.findOne({
        where: [{ endpoint }, { method: req.method }],
      });
      if (!permission) {
        return res.status(403).send(
          errorResponse({
            status: 403,
            // name: "ForbiddenError",
            message: "Forbidden",
            details: "You don't have permission to access this route",
          })
        );
      }

      const role_permission = await Role_permission.findOne({
        where: {
          [Op.and]: [{ PermissionId: permission.id }, { RoleId: role.id }],
        },
      });
      if (role_permission) {
        return await next();
      } else {
        return res.status(403).send(
          errorResponse({
            status: 403,
            // name: "ForbiddenError",
            message: "Forbidden",
            details: "You don't have permission to access this route",
          })
        );
      }
    }
  } catch (error) {
    console.log("error");
    console.log(error);
    return res.status(500).send(error);
  }
};
