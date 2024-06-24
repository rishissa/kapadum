
import { DataTypes } from 'sequelize';
import sequelize from '../../../../database/index.js';

// Define the Post model using the provided Sequelize instance
const Marquee = sequelize.define("Marquee", {
  name: {
    type: DataTypes.STRING,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
});

Marquee.sync()
export default Marquee;