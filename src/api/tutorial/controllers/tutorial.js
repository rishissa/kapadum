import { createActivityLog } from "../../../services/createActivityLog.js";
import { getPagination, getMeta } from "../../../services/pagination.js";
import { errorResponse } from "../../../services/errorResponse.js";
import { verify } from "../../../services/jwt.js";
import Tutorial from './../models/tutorial.js';
import sequelize from "../../../../database/index.js";

export async function create(req, res) {
  const t = await sequelize.transaction();

  try {

    const token = verify(req);
    const tutorial = await Tutorial.create(req.body);
    const tutorialActivityLog = await createActivityLog({
      sequelize,
      UserId: token.id,
      event: "NEW_TUTORIAL_ADDED",
      transaction: t,
    });
    await t.commit();

    return res.status(200).send({ message: "Tutorial Created Successfully!", data: tutorial });
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

export async function update(req, res) {
  try {

    const id = req.params.id;
    const [updatedRowsCount, [updatedTutorial]] = await Tutorial.update(req.body, {
      where: { id: id },
      returning: true,
    });
    if (updatedRowsCount === 0) {
      return res.status(400).send(errorResponse({ status: 400, message: "Invalid  ID" }));
    }
    return res.status(200).send({
      message: "Tutorial Updated Successfully!",
      data: updatedTutorial,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({
      status: 500,
      message: "Internal server Error",
      details: error.message,
    }));
  }
}

export async function find(req, res) {
  try {

    const query = req.query;

    const pagination = await getPagination(query.pagination);

    const tutorials = await Tutorial.findAndCountAll({
      offset: pagination.offset,
      limit: pagination.limit,
      include: ['thumbnail']
    });

    const meta = await getMeta(pagination, tutorials.count);

    return res.status(200).send({ data: tutorials.rows, meta });
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

    const id = req.params.id;
    const tutorial = await Tutorial.findOne({
      where: { id: id },
    });
    if (!tutorial) {
      return res.status(404).send(errorResponse({ status: 404, message: "File not found!", details: "id seems to be invalid" }));
    }
    return res.status(200).send({ data: tutorial });
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({
      status: 500,
      message: "Internal server Error",
      details: error.message,
    }));
  }
}

const _delete = async (req, res) => {
  try {

    const id = req.params.id;
    const deletedRowCount = await Tutorial.destroy({
      where: { id: id },
    });
    if (deletedRowCount === 0) {
      return res.status(400).send(errorResponse({ status: 400, message: "Invalid  ID" }));
    }
    return res.status(200).send({ message: "Tutorial Deleted Successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({
      status: 500,
      message: "Internal server Error",
      details: error.message,
    }));
  }
};
export { _delete };
