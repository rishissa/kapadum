import multer, { diskStorage } from 'multer';
import { extname as _extname } from 'path';
import fs from 'fs';
import { randomBytes } from 'crypto';
import { errorResponse } from './errorResponse.js';



const storage = diskStorage({
    destination: 'public/uploads',
    filename: (req, file, cb, res) => {
        try {
            const originalname = file.originalname.split(" ").join("_")
            const uniqueSuffix = randomBytes(16).toString('hex');
            const extname = _extname(originalname);
            const filename = `${originalname}-${uniqueSuffix}${extname}`;
            cb(null, filename);
        } catch (error) {
            console.log(error)
            return res.status(400).send(errorResponse({ status: 400, message: error.message }))
        }
    },
});

const upload = multer({ storage: storage });

export default upload;