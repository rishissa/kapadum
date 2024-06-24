import { errorResponse } from "../../../services/errorResponse.js";
import Media from "../../upload/models/media.js";
import ResellerBanner from "../models/reseller_banner.js";

export async function create(req, res) {
  try {
    const banner = await ResellerBanner.create(req.body);
    return res
      .status(200)
      .send({ message: "Banner Created Successfully!", data: banner });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: "failed to create banner",
        details: "Some internal server error occured!",
      })
    );
  }
}

export async function find(req, res) {
  try {
    const banner = await ResellerBanner.findAll({
      include: [
        { model: Media, as: "mobile_thumbnail", attributes: ["url"] },
        { model: Media, as: "desktop_thumbnail", attributes: ["url"] },
      ],
    });
    return res.status(200).send({ data: banner });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: error.message,
        details: "some internal server error occured!",
      })
    );
  }
}

export async function findOne(req, res) {
  try {
    const { id } = req.params;
    const banner = await ResellerBanner.findByPk(id, {
      include: ["mobile_thumbnail", "desktop_thumbnail"],
    });
    return res.status(200).send({ data: banner });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: error.message,
        details: "some internal server error occured!",
      })
    );
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const banner = await ResellerBanner.findByPk(id);
    if (!banner) {
      return res.status(404).send(
        errorResponse({
          status: 404,
          message: `banner not found with id ${id}`,
        })
      );
    }
    const updateanner = await ResellerBanner.update(req.body, {
      where: { id },
    });
    return res.status(200).send({ message: "banner update successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: error.message,
        details: "some internal server error occured!",
      })
    );
  }
}

export async function destroy(req, res) {
  try {
    const { id } = req.params;
    const banner = await ResellerBanner.findByPk(id);
    if (!banner) {
      return res.status(404).send(
        errorResponse({
          status: 404,
          message: `banner not found with id ${id}`,
        })
      );
    }
    const deletebanner = await ResellerBanner.destroy({ where: { id: id } });
    return res.status(200).send({ message: "banner deleted successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      errorResponse({
        status: 500,
        message: error.message,
        details: "some internal server error occured!",
      })
    );
  }
}
