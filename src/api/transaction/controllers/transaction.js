// controllers/transactionController.js
import { Op } from "sequelize";
import { getPreviousDates } from "../../../services/date.js";
import { errorResponse, tokenError } from "../../../services/errorResponse.js";
import excelExport from "../../../services/excelExport.js";
import { verify } from "../../../services/jwt.js";
import orderBy from "../../../services/orderBy.js";
import { getPagination, getMeta } from "../../../services/pagination.js";
import Transaction from './../models/transaction.js';


export async function create(req, res) {
  try {

    const transaction = await Transaction.create(req.body);
    return res.status(200).send({
      message: "Transaction created successfully!",
      data: transaction,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Failed to create a transaction" });
  }
}


export async function findOne(req, res) {
  try {

    const { id } = req.params;
    const transaction = await Transaction.findByPk(id);

    if (!transaction) {
      return res.status(404).send({ error: "Transaction not found" });
    }

    return res.status(200).send({ data: transaction });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(errorResponse({ status: 500, message: "Internal server Error" }));
  }
}


export async function find(req, res) {
  try {


    const query = req.query;

    const pagination = await getPagination(query.pagination);

    const transactions = await Transaction.findAndCountAll({
      offset: pagination.offset,
      limit: pagination.limit,
    });
    const meta = await getMeta(pagination, transactions.count);
    return res.status(200).send({ data: transactions.rows, meta });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(
        errorResponse({
          status: 500,
          message: "Internal server Error",
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
      whereClause.id = { [Op.in]: body.items }
    }
    const order = orderBy(query);
    const transactions = await Transaction.findAll({
      where: whereClause,
      order: order,
      include: ["user"],
      raw: true
    });
    if (!transactions.length) {
      return res.status(400).send({ message: `No data found for last ${query.days}` })
    }

    const excelFile = await excelExport(transactions)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="output.xlsx"')
    return res.status(200).send(excelFile);
  } catch (error) {
    return res.status(500).send(errorResponse({ status: 500, message: error.message, details: error }))
  }
}
export async function userTransactions(req, res) {
  try {


    const query = req.query;
    const pagination = await getPagination(query.pagination);

    const token = verify(req)
    if (token.error) {
      return res.status(401).send(tokenError(token))
    }

    const transactions = await Transaction.findAndCountAll({
      offset: pagination.offset,
      limit: pagination.limit,
      where: { UserId: token.id }
    });
    const meta = await getMeta(pagination, transactions.count);
    return res.status(200).send({ data: transactions.rows, meta });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(
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

    const { id } = req.params;
    const transaction = await Transaction.findByPk(id);

    if (!transaction) {
      return res.status(404).send({ error: "Transaction not found" });
    }

    await transaction.update(req.body);

    return res.status(200).send({
      message: "Transaction Updated Successfully!",
      data: transaction,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Failed to update transaction" });
  }
}


const _delete = async (req, res) => {
  try {

    const { id } = req.params;
    const transaction = await Transaction.findByPk(id);

    if (!transaction) {
      return res.status(404).send({ error: "Transaction not found" });
    }

    await transaction.destroy();

    return res.status(200).send({ message: "Transaction Deleted Successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Failed to delete transaction" });
  }
};
export { _delete };
