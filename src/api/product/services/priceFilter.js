import Variant from "../../variant/models/variant.js";


export default (query, sequelize) => {
    delete query.category
    const orderBy = query.orderBy ? Object.keys(query.orderBy).map((key) => {
        switch (key) {
            case "price":
                const sortOrder = query.orderBy[key] === "low-to-high" ? "ASC" : "DESC";
                return [
                    { model: Variant, as: "variants" },
                    "price",
                    sortOrder,
                ];
            case "date":
                return ["createdAt", query.orderBy[key]];
            default:
                return [key, query.orderBy[key]];
        }
    })
        : [["createdAt", "DESC"]];

    return orderBy;
};