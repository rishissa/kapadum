
import { DataTypes } from 'sequelize';
import sequelize from '../../../../database/index.js';

const Testimonial = sequelize.define("Testimonial", {
  content: {
    type: DataTypes.TEXT,
  },
  rating: {
    type: DataTypes.DECIMAL,
  },
});

Testimonial.sync();
export default Testimonial;
