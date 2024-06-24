
import { DataTypes } from 'sequelize';
import sequelize from '../../../../database/index.js';

const Wallet = sequelize.define("Wallet", {
  amount: {
    type: DataTypes.DECIMAL,
  },
  transaction_type: {
    type: DataTypes.ENUM("DEBIT", "CREDIT"),
  },
  reason: {
    type: DataTypes.ENUM("PURCHASE", "WITHDRAWAL", "ADDITION", "PAYOUT_SENT"),
  },
  remark: {
    type: DataTypes.TEXT,
  },
});
Wallet.sync();
export default Wallet;