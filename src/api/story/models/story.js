
import { DataTypes } from 'sequelize';
import sequelize from '../../../../database/index.js';

const Story = sequelize.define("Story", {

});

Story.sync();
export default Story;