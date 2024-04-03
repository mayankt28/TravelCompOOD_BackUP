// documentController.js
const Document = require('../models/Document');
const path = require('path');
const ErrorResponse = require("../utils/errorResponse");

// Controller function to upload a document
exports.uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new ErrorResponse("No File Uploaded !", 400));
        }

        const { originalname, filename, path: filePath } = req.file;
        console.log(originalname, filename, filePath);

        //Create a new document record in the database
        const document = new Document({
            filename: originalname,
            systemFilename: filename,
            path: filePath,
            ownerId: req.user.id 
        });

        await document.save();

        res.json({ message: 'File uploaded successfully !', document });

    } catch (error) {
        next(error);
    }
};

// Controller function to get a document by its systemFilename
exports.getDocumentBySystemFilename = async (req, res, next) => {
    try {
        const systemFilename = req.params.systemFilename;
        const document = await Document.findOne({ systemFilename });
        
        if (!document) {
            return next(new ErrorResponse("File Not Found !", 404));
        }

        if (req.user.id !== document.ownerId.toString()) {
            return next(new ErrorResponse("Forbidden !", 403))
        }
    
        
        res.sendFile(path.join(__dirname, '..', 'uploads', systemFilename));
    } catch (error) {
        next(error);
    }
};

