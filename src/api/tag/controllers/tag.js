// Controller function to create a new post

import { Op } from "sequelize";
import { errorResponse } from "../../../services/errorResponse.js";
import { getPagination, getMeta } from "../../../services/pagination.js";
import orderBy from "../../../services/orderBy.js";
import Tag from './../models/tag.js';
import blukTag from "../../product/services/blukTag.js";
import sequelize from "../../../../database/index.js";


export async function create(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const { tags, ProductId } = req.body;
    const createdTags = await blukTag({ tags, ProductId, transaction })
    await transaction.commit()
    return res.status(200).send({ data: createdTags });
  } catch (error) {
    console.log(error);
    await transaction.rollback();
    return res.status(500).send({ error: "Failed to create a tag" });
  }
}

export async function createMany(req, res) {
  try {

    const tag = await Tag.create(req.body);
    return res.status(200).send({ data: tag });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}

// Controller function to get all posts
export async function find(req, res) {
  try {

    const query = req.query;
    const pagination = await getPagination(query.pagination);
    const order = orderBy(query);
    const tags = await Tag.findAndCountAll({
      offset: pagination.offset,
      limit: pagination.limit,
      order: order,
    });
    const meta = await getMeta(pagination, tags.count);
    return res.status(200).send({ data: tags.rows, meta });
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
  try {

    const { id } = req.params;
    const tag = await Tag.findOne({ where: { id }, include: ['products'] });
    if (!tag) return res.status(400).send(errorResponse({ message: "Invalid Tag ID" }));
    return res.status(200).send({ data: tag });
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}


export async function update(req, res) {
  try {

    const { id } = req.params;
    const [gettag] = await Tag.findByPk(id);

    if (!gettag) return res.status(400).send(errorResponse({ message: "Invalid Tag ID" }));
    const tag = await Tag.update(req.body, {
      where: { id },
      returning: true,
    });
    return res.status(200).send({ message: "Tag Updated!", data: tag[1][0] });
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}


const _delete = async (req, res) => {
  try {

    const { id } = req.params;
    const gettag = await Tag.findByPk(id);

    if (!gettag) return res.status(400).send(errorResponse({ message: "Invalid ID" }));
    await Tag.destroy({ where: { id } });
    return res.status(200).send({ message: `Tag with id ${id} deleted successfully!` });
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
};
export { _delete };

// Controller function to get all posts
export async function search(req, res) {
  try {

    const query = req.query;
    const qs = query.qs;
    const pagination = await getPagination(query.pagination);
    const order = orderBy(query);
    const tags = await Tag.findAndCountAll({
      offset: pagination.offset,
      limit: pagination.limit,
      order: order,
      where: { name: { [Op.iLike]: `%${qs}%` } },
    });
    const meta = await getMeta(pagination, tags.count);
    return res.status(200).send({ data: tags.rows, meta });
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}
