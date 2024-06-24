// Controller function to create a new post

import { errorResponse } from "../../../services/errorResponse.js";
import { verify } from "../../../services/jwt.js";
import { getPagination, getMeta } from "../../../services/pagination.js";
import orderBy from "../../../services/orderBy.js";
import { Op } from "sequelize";
import { getPreviousDates } from "../../../services/date.js";
import excelExport from "../../../services/excelExport.js";
import Support_ticket from './../models/support_ticket.js';
import User from './../../user/models/user.js';


export async function create(req, res) {
  try {
    const body = req.body;
    const token = verify(req);
    const supportTicket = await Support_ticket.create({
      title: body.title,
      description: body.description,
      UserId: token.id,
      status: "OPEN",
    });
    return res.status(200).send({ data: supportTicket });
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

export async function find(req, res) {
  try {
    const query = req.query;
    const pagination = await getPagination(query.pagination);
    const order = orderBy(query);
    const supportTicket = await Support_ticket.findAndCountAll({
      offset: pagination.offset,
      limit: pagination.limit,
      order: order,
    });
    const meta = await getMeta(pagination, supportTicket.count);
    return res.status(200).send({ data: supportTicket.rows, meta });
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

// Controller function to get all posts
export async function userTickets(req, res) {
  try {

    const query = req.query;
    const token = verify(req);
    const pagination = await getPagination(query.pagination);
    const order = orderBy(query);
    const supportTicket = await Support_ticket.findAndCountAll({
      offset: pagination.offset,
      limit: pagination.limit,
      order: order,
      where: { UserId: token.id },
    });
    const meta = await getMeta(pagination, supportTicket.count);
    return res.status(200).send({ data: supportTicket.rows, meta });
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

// Controller function to get all posts
export async function userSingleTicket(req, res) {
  try {

    const query = req.query;
    const id = req.params.id;
    const token = verify(req);

    const supportTicket = await Support_ticket.findByPk(id, {
      where: { UserId: token.id },
    });
    return res.status(200).send({ data: supportTicket });
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
    const supportTicket = await Support_ticket.findOne({
      where: { id },
    });
    if (supportTicket) {
      return res.status(200).send({ data: supportTicket });
    } else {
      return res.status(404).send(errorResponse({
        status: 404,
        message: `Support Ticket with Id ${id} Not Found`,
        details: "Support ticket id seems to be invalid",
      }));
    }
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

    const { id } = req.params;
    const getsupportTicket = await Support_ticket.findByPk(id);

    if (!getsupportTicket) {
      return res.status(400).send(errorResponse({ message: "Invalid Ticket ID" }));
    }
    const [rowsCount, [supportTicket]] = await Support_ticket.update(req.body, {
      where: { id },
      returning: true,
    });
    return res.status(200).send({
      message: "Support Ticket Updated",
      data: supportTicket,
    });
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

export async function changeStatus(req, res) {
  try {
    console.log("change status");

    const { id } = req.params;
    const params = req.params;
    if (!["OPEN", "CLOSED", "IN_PROGRESS", "ON_HOLD"].includes(params.status)) {
      return res.status(400).send(
        errorResponse({
          message: 'status must be one of ["OPEN", "CLOSED", "IN_PROGRESS", "ON_HOLD"]',
        })
      );
    }
    const getsupportTicket = await Support_ticket.findByPk(id);

    if (!getsupportTicket) {
      return res.status(400).send(errorResponse({ message: "Invalid Ticket ID" }));
    }
    if (getSupport_ticket.status === params.status) {
      return res.status(400).send(errorResponse({ message: `Support Ticket Status Is Already Status is already ${params.status}` }));
    }
    const [rowsCount, [supportTicket]] = await Support_ticket.update(
      { status: params.status },
      { where: { id, status: { [Op.ne]: params.status } }, returning: true }
    );
    return res.status(200).send({
      message: "Support Ticket Status Has Been Updated!",
      data: supportTicket,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({
      status: 500,
      message: "Internal server Error",
      details: error.message,
    })
    );
  }
}

export const _delete = async (req, res) => {
  try {

    const { id } = req.params;
    const getsupportTicket = await Support_ticket.findByPk(id);

    if (getsupportTicket) {
      const supportTicket = await Support_ticket.destroy({
        where: { id },
      });
      return res.status(200).send({ status: 201, message: "Support ticket Deleted Successfully" });
    } else {
      return res.status(404).send(errorResponse({ status: 404, message: "Support Ticket Not Found" }));
    }
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
};

export async function exportToExcel(req, res) {
  try {

    const query = req.query;
    const order = orderBy(query);
    const body = req.body;

    const whereClause = {};
    if (body.items.length && Array.isArray(body.items)) {
      whereClause.id = { [Op.in]: body.items }
    }

    const support_tickets = await Support_ticket.findAll({
      where: whereClause,
      order: order,
      include: [{ model: User, as: "user", attributes: ["email", "name"] }],
      raw: true
    });
    if (!support_tickets.length) {
      return res.status(400).send({ message: `No data found for last ${query.days} days` })
    }

    const excelFile = await excelExport(support_tickets)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="output.xlsx"')
    return res.status(200).send(excelFile);
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({
      status: 500,
      message: "Internal server Error",
      details: error.message,
    }));
  }
}