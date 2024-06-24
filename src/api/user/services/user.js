import Subscription from "../../subscription/models/subscription.js";
import User from "../models/user.js";
export async function isPremiumUser({ id, sequelize }) {
  try {
    const user = await User.findByPk(id, {
      include: [
        "role",
        {
          model: Subscription,
          as: "subscriptions",
          include: ["plan"],
        },
      ],
    });
    const subscriptions = user.subscriptions;
    if (subscriptions.length > 0) {
      const recentSub = subscriptions.reduce((acc, curr) => {
        return curr.id > acc.id ? curr : acc;
      });
      console.log(recentSub);
      if (new Date(recentSub.valid_to) > new Date()) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return { error };
  }
}

export const generateOTP = () => {
  // Generate a random 6-digit number
  const min = 100000;
  const max = 999999;
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;

  // Ensure the OTP is exactly 6 digits by converting it to a string
  return otp.toString();
};
