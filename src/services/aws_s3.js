import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";
// const Transform = require('stream').Transform;
import { config } from "dotenv"
config()
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const region = process.env.S3_REGION;
const Bucket = process.env.S3_BUCKET;
const aws_s3_uploader = async (file) => {
    const filesToUpload = await new Upload({
        client: new S3Client({
            credentials: {
                accessKeyId,
                secretAccessKey
            },
            region
        }),
        params: {
            ACL: 'public-read',
            Bucket,
            Key: file.originalname,
            Body: file.buffer
        },
        tags: [],
        queueSize: 4,
        partSize: 1024 * 1024 * 5,
        leavePartsOnError: false,
    }).done()
    return filesToUpload.Location

}

export default aws_s3_uploader;