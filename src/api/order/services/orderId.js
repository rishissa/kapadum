import { randomBytes as _randomBytes } from "crypto";

const generateOrderId = (prefix) => {
  const order_id_prefix = prefix || "ORD";
  const order_id_length = 10;

  const generatedOrderId = order_id_prefix + _randomBytes(order_id_length / 2).toString("hex").toUpperCase();
  return generatedOrderId;
};

const generateTransactionId = (prefix) => {
  const randomBytes = _randomBytes(5);
  const transactionId = (prefix || "WLT") + randomBytes.toString("hex").toUpperCase();
  return transactionId.substring(0, 13);
};

export default {
  generateOrderId,
  generateTransactionId,
};
