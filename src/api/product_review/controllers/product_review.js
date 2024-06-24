
import { getPagination, getMeta } from "../../../services/pagination.js";
import { errorResponse, tokenError } from "../../../services/errorResponse.js";
import { verify } from "../../../services/jwt.js";
import Product_review from "../models/product_review.js";

// Controller function to create a new post



export async function create(req, res) {
    const t = await sequelize.transaction();
    try {

        const body = req.body;
        const token = verify(req)
        if (token.error) return res.status(401).send(tokenError(token))
        const product_review = await Product_review.create({ ...body, UserId: token.id }, { transaction: t });
        if (body.gallery && body.gallery.length) {
            let galleryArray = body.gallery.map(item => {
                return {
                    ProductReviewId: product_review.id,
                    MediumId: item
                }
            })
            await Product_review_gallery.bulkCreate(galleryArray, { transaction: t })
        }
        await t.commit();
        return res.status(200).send({ data: product_review })
    } catch (error) {
        await t.rollback();
        console.log(error);
        return res.status(500).send(errorResponse({ message: error.message, status: 500 }));
    }
}

// Controller function to get all posts
export async function find(req, res) {
    try {

        const query = req.query;
        const token = verify(req)
        if (token.error) return res.status(401).send(tokenError(token))
        const pagination = await getPagination(query.pagination)
        const product_reviews = await Product_review.findAndCountAll({
            offset: pagination.offset,
            limit: pagination.limit,
            include: ["product", "gallery"]
        });
        const meta = await getMeta(pagination, product_reviews.count)
        return res.status(200).send({ data: product_reviews.rows, meta });
    } catch (error) {
        console.log(error);
        return res.status(500).send(errorResponse({ message: error.message, status: 500 }));
    }
}

// Controller function to get all posts
export async function findByProduct(req, res) {
    try {

        const query = req.query;
        const { id } = req.params
        const pagination = await getPagination(query.pagination)
        const product_reviews = await Product_review.findAndCountAll({
            where: { ProductId: id },
            offset: pagination.offset,
            limit: pagination.limit,
            include: ["gallery"]
        });
        const meta = await getMeta(pagination, product_reviews.count)
        return res.status(200).send({ data: product_reviews.rows, meta });
    } catch (error) {
        console.log(error);
        return res.status(500).send(errorResponse({ message: error.message, status: 500 }));
    }
}

export async function findOne(req, res) {
    try {

        const { id } = req.params
        const product_review = await Product_review.findByPk(id, { include: ["product", "gallery"] });
        if (!product_review) {
            return res.status(400).send(errorResponse({ message: "Invalid ID" }))
        }
        return res.status(200).send({ data: product_review })
    } catch (error) {
        console.log(error);
        return res.status(500).send(errorResponse({ message: error.message, status: 500 }));
    }
}


export async function update(req, res) {
    try {

        const { id } = req.params
        const getproduct_review = await Product_review.findByPk(id)

        if (!getproduct_review) {
            return res.status(400).send(errorResponse({ message: "Invalid ID" }))
        }
        const product_review = await Product_review.update(req.body, { where: { id }, returning: true });
        return res.status(200).send({ message: "product_review updated", data: product_review[1][0] })
    } catch (error) {
        console.log(error);
        return res.status(500).send(errorResponse({ message: error.message, status: 500 }));
    }
}


const _delete = async (req, res) => {
    try {

        const { id } = req.params;
        const getproduct_review = await Product_review.findByPk(id);

        if (!getproduct_review) {
            return res.status(400).send(errorResponse({ message: "Invalid ID" }));
        }
        const product_review = await Product_review.destroy({ where: { id } });
        return res.status(200).send({ message: "product_review deleted!" });
    } catch (error) {
        console.log(error);
        res.status(500).send(errorResponse({ message: error.message, status: 500 }));
    }
};
export { _delete };

