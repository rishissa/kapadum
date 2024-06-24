import { errorResponse } from "../../../services/errorResponse.js";
import { getPagination, getMeta } from "../../../services/pagination.js";
import Collection from "../../collection/models/collection.js";


export async function create(req, res) {
  try {


    const collectionStatic = await Collection_static.create(req.body);
    return res.status(200).send({
      message: "Collection Static Created Successfully!",
      data: collectionStatic,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Internal server error",
        details: "failed to perform action,some internal server error occured",
      })
    );
  }
}


export async function find(req, res) {
  try {

    const query = req.query;

    const pagination = await getPagination(query.pagination);
    const collectionStatic = await Collection_static.findAndCountAll({
      offset: pagination.offset,
      limit: pagination.limit,
    });

    const meta = await getMeta(pagination, collectionStatic.count);

    return res.status(200).send({
      data: collectionStatic.rows,
      meta,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Internal server error",
        details: "Failed to perform action, some internal server error occurred",
      })
    );
  }
}

export async function findOne(req, res) {
  try {

    const { id } = req.params;
    const collectionItem = await Collection_static.findOne({
      where: { id },
    });

    if (collectionItem) {
      return res.status(200).send(collectionItem);
    } else {
      return res.status(400).send({ error: "Invalid Item Id" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Internal server Error",
      })
    );
  }
}


export async function update(req, res) {
  try {

    const { id } = req.params;
    const collectionStatic = await Collection_static.findByPk(id);

    if (!collectionStatic) {
      return res.status(404).send(errorResponse({ message: "Collection Static not found" }));
    }

    await collectionStatic.update(req.body);

    return res.status(200).send({
      message: "Collection Static Updated Successfully!",
      data: collectionStatic,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Internal server error",
        details: "failed to perform action,some internal server error occured",
      })
    );
  }
}


export const _delete = async (req, res) => {
  try {

    const { id } = req.params;
    const collectionStatic = await Collection_static.findByPk(id);

    if (!collectionStatic) {
      return res.status(404).send(errorResponse({ message: "Collection Static not found" }));
    }

    await collectionStatic.destroy();

    return res.status(200).send({ message: "Collection Static Deleted Successfully!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ error: "Failed to delete collection static" });
  }
};


export async function getProducts(req, res) {
  try {

    const { id } = req.params;
    const collectionStatic = await Collection_static.findByPk(id);

    if (!collectionStatic) {
      return res.status(404).send(errorResponse({ message: "Collection Static not found " }));
    }

    const pagination = await getPagination(req.query.pagination);
    const products = await Product.findAndCountAll({
      distinct: true,
      include: [
        {
          model: Collection_static,
          as: "collection_static",
          where: { id },
        },
      ],
      offset: pagination.offset,
      limit: pagination.limit,
    });

    const meta = await getMeta(pagination, products.count);
    return res.status(200).send({ collectionStatic, data: products.rows, meta });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "Internal server error",
        details: "failed to perform action,some internal server error occured",
      })
    );
  }
}
