import { DataTypes } from "sequelize";
import sequelize from "../../../../database/index.js";

const Tutorial = sequelize.define("Tutorial", {
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  video_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

Tutorial.sync();
export default Tutorial;