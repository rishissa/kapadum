import { DataTypes } from 'sequelize';
// Create a Sequelize instance for the main database
import sequelize from '../../../../database/index.js';

const Role = sequelize.define("Role", {
  name: {
    type: DataTypes.STRING,
    unique: true
  },
  description: {
    type: DataTypes.STRING
  }
})
Role.sync();
export default Role;
