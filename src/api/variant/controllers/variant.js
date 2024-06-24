import { getPagination, getMeta } from "../../../services/pagination.js";

import { errorResponse } from "../../../services/errorResponse.js";
import sequelize from "../../../../database/index.js";
import Variant from "../models/variant.js";
import Media from "../../upload/models/media.js";
import Product from "../../product/models/product.js";
import { Op } from "sequelize";
const Variant_gallery = sequelize.models.Variant_gallery;
export async function create(req, res) {
  const t = await sequelize.transaction();
  try {
    const variant = await Variant.create(req.body, { transaction: t });
    const body = req.body;

    let variant_gallery_body = [];
    if (body.gallery && body.gallery.length) {
      let obj = body.gallery.flatMap((item) => {
        return { MediaId: item, VariantId: variant.id };
      });
      variant_gallery_body.push(...obj);
    }
    await Variant_gallery.bulkCreate(variant_gallery_body, { transaction: t });
    await t.commit();
    return res
      .status(200)
      .send({ message: "Variant created successfully!", data: variant });
  } catch (error) {
    await t.rollback();
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}

export async function find(req, res) {
  try {
    const Variant = Variant;
    const query = req.query;

    const pagination = await getPagination(query.pagination);

    const variants = await Variant.findAndCountAll({
      include: ["thumbnail", "product", "gallery", "bulk_pricings"],
      offset: pagination.offset,
      limit: pagination.limit,
    });

    const meta = await getMeta(pagination, variants.count);

    return res.status(200).send({ data: variants.rows, meta });
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}

export async function findOne(req, res) {
  try {
    const { id } = req.params;
    const variant = await Variant.findByPk(id, {
      include: ["thumbnail", "product", "gallery", "bulk_pricings"],
    });
    if (variant) {
      return res.status(200).send(variant);
    } else {
      return res
        .status(400)
        .send(errorResponse({ status: 400, message: "Invalid Variant ID" }));
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}

export async function update(req, res) {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const body = req.body;

    const getVariant = await Variant.findByPk(id);
    if (!getVariant) {
      return res
        .status(400)
        .send(errorResponse({ status: 400, message: "Invalid Variant ID" }));
    }
    const [updatedRowsCount, [variant]] = await Variant.update(body, {
      where: { id },
      returning: true,
      transaction: t,
    });

    if (updatedRowsCount === 0) {
      return res
        .status(404)
        .send(errorResponse({ message: "Variant not found" }));
    }

    if (body.gallery && body.gallery.length) {
      const variantMedia = await Variant_gallery.findAll({
        where: { VariantId: id },
      });

      const oldArray = variantMedia.map((entry) => entry.dataValues.MediaId);
      const newArray = req.body.gallery;

      let newElements = [];
      let removedElements = [];

      for (let i = 0; i < newArray.length; i++) {
        if (!oldArray.includes(newArray[i])) {
          newElements.push(newArray[i]);
        }
      }

      for (let i = 0; i < oldArray.length; i++) {
        if (!newArray.includes(oldArray[i])) {
          removedElements.push(oldArray[i]);
        }
      }

      const addArray = newElements.map((item) => ({
        VariantId: id,
        MediaId: item,
      }));

      const destroyVariantMedia = await Variant_gallery.destroy(
        {
          where: {
            MediaId: removedElements,
          },
        },
        { transaction: t }
      );

      await Variant_gallery.bulkCreate(addArray, { transaction: t });
    }

    await t.commit();
    return res
      .status(200)
      .send({ message: "Variant updated successfully!", data: variant });
  } catch (error) {
    await t.rollback();
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}

const _delete = async (req, res) => {
  try {
    const { id } = req.params;
    const getVariant = await Variant.findByPk(id);
    if (!getVariant) {
      return res
        .status(400)
        .send(errorResponse({ status: 400, message: "Invalid Variant ID" }));
    }
    const variant = await Variant.destroy({ where: { id } });
    await Variant_gallery.destroy({ where: { VariantId: id } });
    return res.status(200).send({ message: "variant deleted successfully!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
};
export { _delete };

export async function selectedProductVariants(req, res) {
  try {
    var product_variants = req.body.product_variants;
    console.log(product_variants);
    const variants = await Variant.findAll({
      where: { id: { [Op.in]: product_variants } },
      include: [
        {
          model: Product,
          as: "product",
          include: [
            { model: Media, as: "thumbnail", attributes: ["id", "url"] },
          ],
        },
      ],
    });

    return res.status(200).send({ data: variants });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send(errorResponse({ status: 400, message: err.message }));
  }
}
