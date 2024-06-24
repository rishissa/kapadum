import pdf from "pdf-creator-node";
import fs from "fs";
import path from "path";

var options = {
    width: "600px",
    orientation: "portrait",
    border: "10mm",

};

const data = {
    name: "Narayan Patel",
    phone: "+91 9999999999",
    address: "Civil lines , Raipur Chhattisgarh 492001",
    invoice_number: "112233",
    invoice_date: "02/05/2024",
    products: [
        {
            name: "asual Sneaker Shoes for Men",
            quantity: 2,
            price: "$100",
            total_price: "$200"
        },
        {
            name: "asual Sneaker Shoes for Men",
            quantity: 2,
            price: "$100",
            total_price: "$200"
        },
        {
            name: "asual Sneaker Shoes for Men",
            quantity: 2,
            price: "$100",
            total_price: "$200"
        },
        {
            name: "asual Sneaker Shoes for Men",
            quantity: 2,
            price: "$100",
            total_price: "$200"
        },
        {
            name: "asual Sneaker Shoes for Men",
            quantity: 2,
            price: "$100",
            total_price: "$200"
        }
    ],
    sub_total: "$600",
    tax: "00",
    total: "$600"
}

export const createInvoice = async (data, type) => {
    try {
        let html
        switch (type) {
            case "order":
                html = fs.readFileSync(path.join(process.cwd(), "/views/order-invoice.html"), "utf8");
                break;
            case "subscription":
                html = fs.readFileSync(path.join(process.cwd(), "/views/subscription-invoice.html"), "utf8");
                break;
            case "user-subscription":
                html = fs.readFileSync(path.join(process.cwd(), "/views/user-subscription-invoice.html"), "utf8");
                break;

            default:
                break;
        }
        var document = {
            html: html,
            data: data,
            path: "./output.pdf",
            type: "",
        };
        const generatedPDF = await pdf.create(document, options);

        const pdfData = fs.readFileSync(generatedPDF.filename);

        const pdfBuffer = Buffer.from(pdfData);
        return pdfBuffer
    } catch (error) {
        return { error }
    }
}

