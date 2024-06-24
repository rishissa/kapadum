import Razorpay from "razorpay";
import Global from "../api/global/models/global.js";
// import dbConnection from "./dbConnection.js";

export async function getRazorpay({ razorpay_key, razorpay_secret }) {
  return new Razorpay({
    key_id: razorpay_key,
    key_secret: razorpay_secret,
  });
}

export async function defaultRazorpay() {
  const global = await Global.findOne({
    raw: true
  });

  const { razorpay_key, razorpay_secret } = global;

  const instance = new Razorpay({
    key_id: razorpay_key,
    key_secret: razorpay_secret,
  });

  return {
    instance,
    credential: {
      razorpay_key,
      razorpay_secret,
    }
  };
}

