import { getPagination, getMeta } from "../../../services/pagination.js";
import { errorResponse } from "../../../services/errorResponse.js";
import { Op, json, literal } from "sequelize";
import bulkTag from "../services/blukTag.js";
import priceFilter from "../services/priceFilter.js";
import productMetrics from "../../../services/productMetrics.js";
import orderBy from "../../../services/orderBy.js";
import tenantMetric from "../../../services/tenantMetric.js";
import { tenant_metric_fields } from "../../../constants/tenant_metric.js";
import { product_metric_field } from "../../../constants/productMetric.js";
import { launch } from "puppeteer";
import { join } from "path";
import pdfGenerator from "../services/pdfGenerator.js";
import excelExport from "../../../services/excelExport.js";
import importProduct from "../services/importProduct.js";
import Product from "../models/product.js";
import Variant from "../../variant/models/variant.js";
import Category from "../../category/models/category.js";
import sequelize from "../../../../database/index.js";
const Product_gallery = sequelize.models.Product_gallery;
const Variant_gallery = sequelize.models.Variant_gallery;
import Tag from "./../../tag/models/tag.js";
import Media from "../../upload/models/media.js";
import Product_metric from "../../product_metrics/models/product_metrics.js";
import Bulk_pricing from "./../../bulk_pricing/models/bulk_pricing.js";
import { promises as fs } from "fs";
import ImportedProduct from "../models/imported_product.js";

export async function create(req, res) {
  console.log("Inside Product create");
  const transaction = await sequelize.transaction();
  try {
    const body = req.body;
    const variants = body.variants;
    const product = await Product.create(
      // {
      //   name: body.name,
      //   description: body.description,
      //   CategoryId: body.CategoryId || null,
      //   SubCategoryId: body.SubCategoryId || null,
      //   CollectionId: body.CollectionId || null,
      //   CollectionStaticId: body.CollectionStaticId || null,
      //   ThumbnailId: body.ThumbnailId || null,
      //   shipping_value: body.shipping_value,
      //   shipping_value_type: body.shipping_value_type,
      //   rating: body.rating,
      //   yt_video_link: body.yt_video_link
      // },
      req.body,
      { transaction: transaction }
    );

    console.log(product);
    let variantArray = [];
    for (const variant of variants) {
      variantArray.push({
        name: variant.name,
        price: variant.price,
        strike_price: variant.price,
        quantity: variant.quantity,
        ProductId: product.id,
        from: variant.from,
        to: variant.to,
        ThumbnailId: variant.ThumbnailId,
        // gallery: [2, 3]
      });
    }
    const createdVariants = await Variant.bulkCreate(variantArray, {
      transaction: transaction,
    });
    let product_gallery_body = [];
    let variant_gallery_body = [];
    // product gellery
    if (body.gallery) {
      if (body.gallery.length) {
        const obj = body.gallery.flatMap((item) => {
          return { MediaId: item, ProductId: product.id };
        });
        product_gallery_body.push(...obj);
      }
    }

    // variant gellery
    for (const [i, variant] of createdVariants.entries()) {
      if (variants[i].gallery && variants[i].gallery.length) {
        let obj = variants[i].gallery.flatMap((item) => {
          return { MediaId: item, VariantId: variant.id };
        });
        variant_gallery_body.push(...obj);
      }
    }

    await Product_gallery.bulkCreate(product_gallery_body, {
      transaction: transaction,
    });
    await Variant_gallery.bulkCreate(variant_gallery_body, {
      transaction: transaction,
    });

    let bulk_pricings = [];
    //create bulkVariant
    for (const [i, it] of body.variants.entries()) {
      if (it.bulk_pricing) {
        let obj = it.bulk_pricing.map((bp) => {
          return {
            from: bp.from,
            to: bp.to,
            price: bp.price,
            premiumPrice: bp.premiumPrice,
            VariantId: createdVariants[i].id,
          };
        });

        bulk_pricings.push(...obj);
      }
    }

    const create_bulk_pricing = await Bulk_pricing.bulkCreate(bulk_pricings, {
      transaction: transaction,
    });

    const tags = body.tags;
    let createdTags;
    if (tags && tags.length > 0) {
      createdTags = await bulkTag({
        sequelize,
        tags,
        ProductId: product.id,
        transaction: transaction,
      });
    }
    await transaction.commit();
    // await tenantMetric({ subdomain: req.subdomain, field_name: tenant_metric_fields.total_products });
    return res.status(200).send({
      message: "Product and variants created successfully!",
      data: { product, variants: createdVariants },
      // data: { bulk_pricings },
    });
  } catch (error) {
    console.log(error);
    await transaction.rollback();
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Internal server Error",
        details: error.message,
      })
    );
  }
}

export async function find(req, res) {
  try {
    const query = req.query;
    const category = req.query.category;
    const minPrice = (query.price && parseFloat(query.price.min)) || 0;
    const maxPrice =
      (query.price && parseFloat(query.price.max)) || Number.MAX_SAFE_INTEGER;

    const pagination = await getPagination(query.pagination);
    const order = priceFilter(query, sequelize);

    const products = await Product.findAndCountAll({
      offset: pagination.offset,
      limit: pagination.limit,
      order: order,
      ...(category
        ? { where: { CategoryId: { [Op.in]: JSON.parse(category) } } }
        : {}),
      distinct: true,
      include: [
        {
          model: Variant,
          as: "variants",
          ...(query.price && {
            where: {
              price: {
                [Op.between]: [minPrice, maxPrice],
              },
            },
          }),
          include: ["gallery", "thumbnail", "bulk_pricings"],
        },
        "tags",
        "gallery",
        "thumbnail",
        "sub_category",
        "category",
        "collections",
        "product_metrics",
        // {
        //   model:  Product_review, as: "product_reviews",
        //   attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'average_rating']],
        // }
      ],
      where: {
        is_active: true,
      },
      attributes: {
        include: [
          [
            sequelize.literal(
              '(SELECT ROUND(AVG("rating"), 2) FROM "Product_reviews" WHERE "Product_reviews"."ProductId" = "Product"."id")'
            ),
            "ratings",
          ],
        ],
      },
    });

    const meta = await getMeta(pagination, products.count);
    return res.status(200).send({ data: products.rows, meta });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Internal server Error",
        details: error.message,
      })
    );
  }
}

export async function simpleData(req, res) {
  try {
    const query = req.query;
    const category = req.query.category;
    const minPrice = (query.price && parseFloat(query.price.min)) || 0;
    const maxPrice =
      (query.price && parseFloat(query.price.max)) || Number.MAX_SAFE_INTEGER;

    const pagination = await getPagination(query.pagination);
    const order = priceFilter(query, sequelize);

    const products = await Product.findAndCountAll({
      offset: pagination.offset,
      limit: pagination.limit,
      order: order,
      attributes: ["id", "name"],
    });

    const meta = await getMeta(pagination, products.count);
    return res.status(200).send({ data: products.rows, meta });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Internal server Error",
        details: error.message,
      })
    );
  }
}

export async function findOne(req, res) {
  const t = await sequelize.transaction();

  const description = req.query.description;

  let filters = [];
  if (description == "false") {
    filters.push("description");
  }
  try {
    const { id } = req.params;
    const product = await Product.findOne({
      where: {
        id: id,
        is_active: true,
      },
      include: [
        {
          model: Variant,
          as: "variants",
          include: ["thumbnail", "gallery", "bulk_pricings"],
        },
        {
          model: Category,
          as: "category",
        },
        "thumbnail",
        "tags",
        "gallery",
        "sub_category",
        "collections",
      ],
      attributes: {
        exclude: filters,
        include: [
          [
            sequelize.literal(
              '(SELECT ROUND(AVG("rating"), 2) FROM "Product_reviews" WHERE "Product_reviews"."ProductId" = "Product"."id")'
            ),
            "ratings",
          ],
        ],
      },
    });
    if (!product) {
      return res.status(404).send(
        errorResponse({
          status: 404,
          message: "Product not found!",
          details: "product id seems to be invalid",
        })
      );
    }

    const randomProducts = await Product.findAll({
      where: {
        is_active: true,
        id: {
          [Op.ne]: id,
        },
        is_active: true,
        ...(product.dataValues.CategoryId
          ? {
              CategoryId: product.dataValues.CategoryId,
            }
          : {}),
      },
      order: sequelize.literal("RANDOM()"),
      limit: 6,
      attributes: {
        exclude: filters,
        include: [
          [
            sequelize.literal(
              '(SELECT ROUND(AVG("rating"), 2) FROM "Product_reviews" WHERE "Product_reviews"."ProductId" = "Product"."id")'
            ),
            "rating",
          ],
        ],
      },
      include: [
        {
          model: Variant,
          as: "variants",
          include: ["thumbnail", "gallery", "bulk_pricings"],
        },
        {
          model: Media,
          as: "thumbnail",
        },
        {
          model: Category,
          as: "category",
        },
        "tags",
        "gallery",
      ],
    });

    await productMetrics({
      product_id: [product.id],
      field_name: product_metric_field.view_count,
      transaction: t,
    });
    await t.commit();
    return res.status(200).send({ data: { product, randomProducts } });
  } catch (error) {
    console.log(error);
    await t.rollback();
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
    const getProduct = await Product.findByPk(id);
    if (!getProduct) {
      return res.status(404).send(
        errorResponse({
          status: 404,
          message: "Product ID seems to be invalid!",
          details: "Requested Product Id Does not exists",
        })
      );
    }
    const [rows, [product]] = await Product.update(req.body, {
      where: { id },
      returning: true,
      transaction: t,
    });

    if (body.gallery && body.gallery.length) {
      /// removing gallery images
      const productMedia = await Product_gallery.findAll({
        where: { ProductId: id },
      });

      const oldArray = productMedia.map((entry) => entry.dataValues.MediaId);
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
        ProductId: id,
        MediaId: item,
      }));

      console.log(newElements, addArray, removedElements);

      const destroyproductMedia = await Product_gallery.destroy(
        {
          where: { MediaId: removedElements },
        },
        { transaction: t }
      );

      await Product_gallery.bulkCreate(addArray, { transaction: t });
    }

    await t.commit();
    return res.status(200).send({
      message: "product updated successfully!",
      data: product,
    });
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
    const getProduct = await Product.findByPk(id);
    if (!getProduct) {
      return res.status(400).send(
        errorResponse({
          status: 400,
          message: "Product ID seems to be invalid!",
          details: "Requested Product Id Does not exists",
        })
      );
    }
    const product = await Product.update(
      { is_active: false },
      { where: { id } }
    );
    const variants = await Variant.update(
      { is_active: false },
      { where: { ProductId: id } }
    );
    return res.status(200).send({ message: "product deleted successfully!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
};
export { _delete };

export async function search(req, res) {
  try {
    const query = req.query;
    const qs = query.qs.trim();
    const pagination = await getPagination(query.pagination);
    const tags = query?.tags?.toLowerCase().split("_");
    let filters = [];
    const description = req.query.description;

    if (description == "false") {
      filters.push("description");
    }

    // const order = orderBy(req.query);
    const order = priceFilter(req.query, sequelize);

    const whereClause = {};
    if (query.categories) {
      whereClause.CategoryId = { [Op.in]: JSON.parse(query.categories) };
    }
    console.log(whereClause);
    const products = await Product.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${qs}%` } },
          { description: { [Op.iLike]: `%${qs}%` } },
          literal(
            `EXISTS (SELECT * FROM "Variants" AS "variants" WHERE "Product"."id" = "variants"."ProductId" AND "variants"."name" ILIKE '%${qs}%')`
          ),
        ],
        is_active: true,
        ...whereClause,
      },
      order: order,
      offset: pagination.offset,
      limit: pagination.limit,
      distinct: true,
      include: [
        {
          model: Variant,
          as: "variants",
          include: ["thumbnail", "gallery", "bulk_pricings"],
        },
        {
          model: Category,
          as: "category",
        },
        "thumbnail",
        {
          model: Tag,
          as: "tags",
          ...(query.tags && {
            where: {
              name: {
                [Op.iLike]: { [Op.any]: tags.map((item) => `%${item}%`) },
              },
            },
          }),
        },
      ],
      attributes: {
        exclude: filters,
        include: [
          [
            sequelize.literal(
              '(SELECT ROUND(AVG("rating"), 2) FROM "Product_reviews" WHERE "Product_reviews"."ProductId" = "Product"."id")'
            ),
            "rating",
          ],
        ],
      },
    });
    const meta = await getMeta(pagination, products.count);
    return res.status(200).send({ data: products.rows, meta });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Internal server Error",
        details: error.message,
      })
    );
  }
}

export async function findByPrice(req, res) {
  try {
    const query = req.query;
    const pagination = await getPagination(query.pagination);
    const order = orderBy(query);
    const price = query.price;
    const products = await Product.findAndCountAll({
      offset: pagination.offset,
      limit: pagination.limit,
      order: [order],
      distinct: true,
      include: [
        {
          model: Variant,
          as: "variants",
          include: ["thumbnail", "gallery", "bulk_pricings"],
          where: {
            [Op.and]: [
              {
                price: {
                  [Op.gte]: price.min,
                },
              },
              {
                price: {
                  [Op.lte]: price.max,
                },
              },
            ],
          },
        },
        {
          model: Media,
          as: "thumbnail",
        },
        {
          model: Category,
          as: "category",
        },
        "tags",
        "gallery",
      ],
      where: {
        is_active: true,
      },
      attributes: {
        include: [
          [
            sequelize.literal(
              '(SELECT ROUND(AVG("rating"), 2) FROM "Product_reviews" WHERE "Product_reviews"."ProductId" = "Product"."id")'
            ),
            "rating",
          ],
        ],
      },
    });
    const meta = await getMeta(pagination, products.count);
    return res.status(200).send({ data: products.rows, meta });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Internal server Error",
        details: error.message,
      })
    );
  }
}

export async function findNRandom(req, res) {
  try {
    const n = req.params.n;
    const query = req.query;
    const minPrice = (query.price && parseFloat(query.price.min)) || 0;
    const maxPrice =
      (query.price && parseFloat(query.price.max)) || Number.MAX_SAFE_INTEGER;

    const description = req.query.description;
    let filters = [];
    if (description == "false") {
      filters.push("description");
    }

    const products = await Product.findAll({
      order: sequelize.literal("RANDOM()"),
      limit: n,
      attributes: {
        exclude: description,
        include: [
          [
            sequelize.literal(
              '(SELECT ROUND(AVG("rating"), 2) FROM "Product_reviews" WHERE "Product_reviews"."ProductId" = "Product"."id")'
            ),
            "rating",
          ],
        ],
      },
      include: [
        {
          model: Variant,
          as: "variants",
          include: ["thumbnail", "gallery", "bulk_pricings"],
          where: {
            [Op.and]: [
              {
                price: {
                  [Op.gte]: minPrice,
                },
              },
              {
                price: {
                  [Op.lte]: maxPrice,
                },
              },
            ],
          },
        },
        {
          model: Media,
          as: "thumbnail",
        },
        {
          model: Category,
          as: "category",
        },
        "tags",
        "gallery",
      ],
      where: {
        is_active: true,
      },
    });

    return res.status(200).send({ data: products });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Internal server Error",
        details: error.message,
      })
    );
  }
}

export async function findNRandomInCategory(req, res) {
  try {
    const n = req.params.n;
    const category_id = req.params.id;
    const query = req.query;
    const minPrice = (query.price && parseFloat(query.price.min)) || 0;
    const maxPrice =
      (query.price && parseFloat(query.price.max)) || Number.MAX_SAFE_INTEGER;
    const products = await Product.findAll({
      where: {
        CategoryId: category_id,
        is_active: true,
      },
      attributes: {
        include: [
          [
            sequelize.literal(
              '(SELECT ROUND(AVG("rating"), 2) FROM "Product_reviews" WHERE "Product_reviews"."ProductId" = "Product"."id")'
            ),
            "rating",
          ],
        ],
      },
      order: sequelize.literal("RANDOM()"),
      limit: n,
      include: [
        {
          model: Variant,
          as: "variants",
          include: ["thumbnail", "gallery", "bulk_pricings"],
          where: {
            [Op.and]: [
              {
                price: {
                  [Op.gte]: minPrice,
                },
              },
              {
                price: {
                  [Op.lte]: maxPrice,
                },
              },
            ],
          },
        },
        {
          model: Media,
          as: "thumbnail",
        },
        {
          model: Category,
          as: "category",
        },
        "tags",
        "gallery",
      ],
    });

    return res.status(200).send({ data: products });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Internal server Error",
        details: error.message,
      })
    );
  }
}

export async function catalouge(req, res) {
  try {
    console.log("entered in Puppeteer");

    const id = req.params.id;

    const products = await Product.findAll({
      where: { id: id },
      include: ["thumbnail", "variants"],
    });

    const pdfpath = await pdfGenerator(
      JSON.parse(JSON.stringify(products)).map((item) => {
        item.thumbnail.url = `http://${"lavisha"}.api.mtl.hangs.in/${
          item.thumbnail.url
        }`;
        console.log(item.thumbnail.url);
        return item.dataValues;
      })
    );

    const url = `https://${req.subdomain}.store.api.mtl.hangs.in/catalouge/${products}`;
    // const url = `https://192.168.3.82.store.api.mtl.hangs.in/catalouge/${products}`;
    const outputfile = join(process.cwd(), "public", "uploads", "example.pdf");

    // Launch the browser
    const browser = await launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" }); // or "domcontentloaded"
    await page.setViewport({ width: 1080, height: 1024 });

    // Generate a PDF with background and save to public/uploads directory
    const pdf = await page.pdf({
      path: outputfile,
      format: "A4",
      printBackground: true,
    });

    // const pdf = fs.readFileSync(path.join(process.cwd(), "output.pdf"), "base64")
    // const pdfBuffer = Buffer.from(pdf, "base64")

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="generated.pdf"'
    );

    await browser.close();

    // res.status(201).sendFile(pdfpath.filename);
    res.status(201).send(pdf);
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Internal server Error",
        details: error.message,
      })
    );
  }
}

export async function findNTrending(req, res) {
  try {
    const n = req.params.n;
    const productMetrics = await Product_metric.findAll({
      limit: n,
      order: [["view_count", "DESC"]],
      raw: true,
    });

    const productIds = productMetrics.map((item) => item.ProductId);
    const products = await Product.findAll({
      where: { id: productIds },
      include: [
        {
          model: Variant,
          as: "variants",
          include: ["thumbnail", "gallery", "bulk_pricings"],
        },
        {
          model: Media,
          as: "thumbnail",
        },
        {
          model: Category,
          as: "category",
        },
        "tags",
        "gallery",
      ],
    });

    return res.status(200).send({ data: products, productMetrics });
  } catch (error) {
    console.error(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Internal server error",
        details: error.message,
      })
    );
  }
}

export async function findNSelling(req, res) {
  try {
    const n = req.params.n;

    const productMetrics = await Product_metric.findAll({
      limit: n,
      order: [["ordered_count", "DESC"]],
      raw: true,
    });

    const productIds = productMetrics.map((item) => item.ProductId);

    const products = await Product.findAll({
      where: { id: productIds },
      include: [
        {
          model: Variant,
          as: "variants",
          include: ["thumbnail", "gallery", "bulk_pricings"],
        },
        {
          model: Media,
          as: "thumbnail",
        },
        {
          model: Category,
          as: "category",
        },
        "tags",
        "gallery",
      ],
    });

    return res.status(200).send({ data: products });
  } catch (error) {
    console.error(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Internal server error",
        details: error.message,
      })
    );
  }
}

export async function exportToExcel(req, res) {
  try {
    const query = req.query;
    const body = req.body;
    const whereClause = {};
    if (body.items.length && Array.isArray(body.items)) {
      whereClause.id = { [Op.in]: body.items };
    }
    const order = orderBy(query);
    const products = await Product.findAll({
      where: whereClause,
      order: order,
      include: [
        { model: Variant, as: "variants", include: ["thumbnail", "gallery"] },
      ],
      raw: true,
    });
    if (!products.length) {
      return res
        .status(400)
        .send({ message: `No data found for last ${query.days}` });
    }

    const excelFile = await excelExport(products);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="output.xlsx"');
    return res.status(200).send(excelFile);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorResponse({ status: 500, message: error.message, details: error })
      );
  }
}

export async function importFromShopify(req, res) {
  try {
    const { access_token, api_key, api_secret, limit } = req.body;
    const products = await importProduct({
      sequelize,
      access_token,
      api_key,
      api_secret,
      limit,
    });
    if (products) {
      return res
        .status(200)
        .send({ message: "Products Imported Successfully!" });
    } else {
      return res
        .status(500)
        .send(errorResponse({ message: "internal server error" }));
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(
        errorResponse({ status: 500, message: error.message, details: error })
      );
  }
}

export async function shareProduct(req, res) {
  try {
    const { id } = req.params;
    console.log(id);
    const transaction = await sequelize.transaction();
    const createMetric = await productMetrics({
      field_name: product_metric_field.shares_count,
      product_id: [id],
      transaction: transaction,
    });
    await transaction.commit();
    return res.status(200).send({ message: "product share count updated" });
  } catch (error) {
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: error.message }));
  }
}

export async function redirectToApp(req, res) {
  try {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Redirecting...</title>
        <script type="text/javascript" src="/public/product_redirect.js" defer>
        </script>
            <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            text-align: center;
            font-weight: bold;
            font-size: 5rem;
        }

        .continue {
            color: green;
        }
    </style>
    </head>
    <body>
        <p>Click <span class="continue">"Continue"</span> to proceed to the product details in app</p>
        <p id="error" style="color: red;"></p>
    </body>
    </html>
  `;

    return res.status(200).send(html, 200);
  } catch (err) {
    console.log(err);
    return res.status(400).send(errorResponse({ message: err.message }));
  }
}

export async function fetchProductsForShare(req, res) {
  try {
    const products = req.body.products;

    const list = await Product.findAll({
      where: { id: { [Op.in]: products } },
      attributes: ["id", "description"],
    });

    return res.status(200).send({ data: list });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send(errorResponse({ status: 400, message: err.message }));
  }
}

export async function wishListProducts(req, res) {
  try {
    const query = req.query;
    const { products } = req.body;
    if (!products || !products.length) {
      return res.status(400).send({ error: { message: "Invalid data" } });
    }
    const allProducts = await Product.findAll({
      where: { id: { [Op.in]: products } },
      include: [
        {
          model: Variant,
          as: "variants",
          include: ["gallery", "thumbnail", "bulk_pricings"],
        },
        "tags",
        "gallery",
        "thumbnail",
        "sub_category",
        "category",
        "collections",
        "product_metrics",
      ],

      attributes: {
        include: [
          [
            sequelize.literal(
              '(SELECT ROUND(AVG("rating"), 2) FROM "Product_reviews" WHERE "Product_reviews"."ProductId" = "Product"."id")'
            ),
            "ratings",
          ],
        ],
      },
    });

    return res.status(200).send({ data: allProducts });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Internal server Error",
        details: error.message,
      })
    );
  }
}

export async function addDemoProducts(req, res) {
  const t = await sequelize.transaction();
  try {
    const data = await fs.readFile("./output.json", "utf-8");
    const jsonData = JSON.parse(data);

    for (const it of jsonData.products) {
      const details = {
        name: it.title,
        description: it.body_html,
        is_active: true,
        shipping_value: 0,
        shipping_value_type: "SHIPPING_PRICE",
        cod_enabled: true,
        product_return: true,
        rating: 4.5,
        enquiry_enabled: true,
        show_price: true,
      };

      const product = await Product.create(details);

      for (const v of it.variants) {
        const variant_data = {
          name: v.title,
          price: v.price,
          premium_price: null,
          strike_price: v.compare_at_price,
          quantity: v.inventory_quantity,
          is_active: true,
          ProductId: product.id,
        };
        const variant = await Variant.create(variant_data);
      }
    }
    await t.commit();
    return res.status(200).send("Done");
  } catch (err) {
    console.log(err);
    await t.rollback();
    return res
      .status(400)
      .send(errorResponse({ status: 400, message: err.message }));
  }
}

export async function updateResellerProduct(req, res) {
  try {
    const id = req.params.id;
    const user_id = res.user;
    //check if product is imported by the reseller
    const product = await ImportedProduct.findOne({
      where: { UserId: user_id, VariantId: id },
    });

    if (!product) {
      return res.status(400).send(
        errorResponse({
          status: 400,
          message: `No Variant is imported with ID:${id}`,
        })
      );
    }

    const body = req.body;
    const updatedVariant = await product.update(body);

    return res.status(200).send(updatedVariant);
  } catch (err) {
    console.log(err.message);
    return res.status(400).send(err.message);
  }
}
