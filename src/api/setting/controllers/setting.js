
import { getPagination, getMeta, errorResponse } from "rapidjet"
import Setting from "../models/setting.js";
import { request, response } from "express";

export const create = async (req, res) => {
    try {

        const getglobal = await Setting.findAll();

        if (getglobal.length !== 0) {
            const { store_type, ...updatePayload } = req.body;

            const updateGLobal = await Setting.update(updatePayload, {
                where: { id: getglobal[0].id },
                returning: true,
            });

            return res.status(200).send({ message: "global updated", data: updateGLobal[1][0] });
        } else {
            const global = await Setting.create(req.body);
            return res.status(200).send({ message: "Global Created Successfully", data: global });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send(errorResponse({ status: 500, message: "Internal Server Error", details: error.message }));
    }
};

export const find = async (req, res) => {
    try {
        const query = req.query;
        const settings = await Setting.findOne();
        return res.status(200).send({ data: settings });
    } catch (error) {
        console.log(error);
        return res.status(500).send(errorResponse({ status: 500, message: "Internal Server Error", details: error.message }));
    }
};
