
import { DataTypes } from 'sequelize';
import sequelize from '../../../../database/index.js';

const Product_review = sequelize.define("Product_review", {
  rating: {
    type: DataTypes.INTEGER,
  },
  review: {
    type: DataTypes.TEXT,
  },
});

Product_review.sync();
export default Product_review;
