import { DataTypes } from "sequelize";
import sequelize from '../../../../database/index.js';

const Media = sequelize.define("Media", {
  name: {
    type: DataTypes.STRING,
    require: true,
  },
  path: {
    type: DataTypes.STRING,
  },
  url: {
    type: DataTypes.STRING,
    require: true,
  },
  width: {
    type: DataTypes.INTEGER,
    require: true,
  },
  height: {
    type: DataTypes.INTEGER,
    require: true,
  },
  size: {
    type: DataTypes.DECIMAL,
    require: true,
  },
  formats: {
    type: DataTypes.JSONB,
  },
});

Media.sync();
export default Media;