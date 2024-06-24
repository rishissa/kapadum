import { DataTypes } from "sequelize";
import sequelize from "../../../../database/index.js";

const AccountDetails = sequelize.define("AccountDetail", {
  bank_name: {
    type: DataTypes.STRING,
  },
  account_number: {
    type: DataTypes.STRING,
  },
  ifsc_code: {
    type: DataTypes.STRING,
  },
  upi_id: {
    type: DataTypes.STRING,
  },
});

AccountDetails.sync();
export default AccountDetails;
