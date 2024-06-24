import { errorResponse, tokenError } from "../../../services/errorResponse.js";
import { verify } from "../../../services/jwt.js";
// const cart = require("../models/cart");
import { handleVariantsTotalPrice } from "../services/cart.js";
import Cart from './../models/cart.js';
import CartVariant from './../models/cartVariant.js';
import Variant from './../../variant/models/variant.js';

export async function addToCart(req, res) {
  try {

    const { VariantId, quantity } = req.body;

    const token = verify(req);
    let findCart = await Cart.findOne({ where: { UserId: 1 } });
    if (findCart === null) {
      findCart = await Cart.create({ totalPrice: 0, UserId: 1 });
    }

    const cart_variant = await CartVariant.findOne({
      where: {
        VariantId: VariantId,
        CartId: findCart.id,
      },
    });

    if (cart_variant) {
      cart_variant.increment({ quantity: quantity });
      await cart_variant.save();
    } else {
      await CartVariant.create({
        VariantId: VariantId,
        CartId: findCart.id,
        quantity: quantity,
      });
    }

    const variant = await Variant.findByPk(VariantId);
    findCart.increment({ totalPrice: variant.price * quantity });
    await findCart.save();
    return res.status(200).send({ message: "Variants added to cart successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

export async function consumerCart(req, res) {
  try {

    const token = verify(req);
    if (token.error) {
      return res.status(401).send(tokenError(token))
    }
    const cartVariants = await CartVariant.findAll({
      include: [
        { model: Cart, where: { UserId: token.id } },
        { model: Variant, attributes: ["id", "name", "price",], include: ["thumbnail"] },
      ],
    });

    if (!cartVariants) {
      return res.status(404).send({
        message: `No cart variants found for user with id=${token.id}`,
      });
    }

    // Calculate total price
    let totalPrice = 0;
    for (const cartVariant of cartVariants) {
      totalPrice += cartVariant.quantity * cartVariant.Variant.price;
    }

    // Add total price to each variant
    const variantsWithTotalPrice = cartVariants.map((cartVariant) => {
      return {
        ...cartVariant.toJSON(),
        totalVariantPrice: cartVariant.quantity * cartVariant.Variant.price,
      };
    });

    return res.status(200).send({
      cartVariants: variantsWithTotalPrice,
      totalPrice: totalPrice,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
}

export async function emptyCart(req, res) {
  try {

    const token = verify(req);

    if (token.error) {
      return res.status(401).send(tokenError(token))
    }
    const findCart = await Cart.findOne({ where: { UserId: token.id } });

    if (findCart === null) {
      const cart = await Cart.create({
        totalPrice: 0,
        UserId: token.id,
      });
      return res.status(200).send({ message: "Your cart is empty now!" });
    }

    const destroyCart = await CartVariant.destroy({
      where: { CartId: findCart.id },
    });

    await findCart.update({ totalPrice: 0 });
    return res.status(200).send({ message: "Your cart is empty now!" });
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({ status: 500, message: "Internal Server Error" }));
  }
}

export async function deleteVariant(req, res) {
  try {

    const { id } = req.params;
    const token = verify(req);

    if (token.error) {
      return res.status(401).send(tokenError(token))
    }

    const cart = await Cart.findOne({ where: { UserId: token.id } });

    if (!cart) {
      return res.status(404).send(errorResponse({ status: 400, message: "Invalid variant id" }));
    }

    const cartVariant = await CartVariant.findOne({
      where: {
        VariantId: id,
        CartId: cart.id,
      },
      include: [Variant],
    });

    if (!cartVariant) {
      return res.status(404).send({
        message: `Variant with id ${id} not found in the cart.`,
      });
    }

    const totalPriceReduction = cartVariant.Variant.price * cartVariant.quantity;

    await cartVariant.destroy();

    cart.totalPrice -= totalPriceReduction;
    await cart.save();

    return res.status(200).send({
      message: `Variant with id ${id} deleted from the cart successfully.`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
