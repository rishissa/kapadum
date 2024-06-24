import { DataTypes } from "sequelize";
import sequelize from "../../../../database/index.js";

const Metric = sequelize.define("Metric", {
    traffic: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
})
Metric.sync();
export default Metric