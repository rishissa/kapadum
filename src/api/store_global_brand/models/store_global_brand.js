import { DataTypes } from "sequelize";

import sequelize from "../../../../database/index.js";

const StoreGlobal_brand = sequelize.define(
  "StoreGlobal_brand",
  {
    name: {
      type: DataTypes.STRING,
    },
    tagline: {
      type: DataTypes.STRING,
    },
    whatsapp_number: {
      type: DataTypes.STRING,
    },
    calling_number: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    about_us: {
      type: DataTypes.TEXT,
    },
    address: {
      type: DataTypes.STRING,
    },
    instagarm: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    facebook: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telegram: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["id"],
      },
    ],
  }
);

StoreGlobal_brand.sync();

export default StoreGlobal_brand;
