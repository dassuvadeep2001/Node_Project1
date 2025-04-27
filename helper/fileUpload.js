const multer = require('multer');
const path = require('path');
const fs = require('fs');

class FileUploader{
    constructor({ folderName = "uploads", supportedFiles = ["image/png", "image/jpg", "image/jpeg"], maxSize = 5 * 1024 * 1024 }){
        this.folderName = folderName;
        this.supportedFiles = supportedFiles;
        this.maxSize = maxSize;
         
        if (!fs.existsSync(this.folderName)){
            fs.mkdirSync(this.folderName, { recursive: true });
        }
    }

    storage(){
        return multer.diskStorage({
            destination: (req, file, cb)=>{
                console.log("file", file);
                
                cb(null, this.folderName);
            },
            filename: (req, file, cb)=>{
                cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`);
            }
        })
    }
    upload(){
        return multer({
           storage: this.storage(),
           limits: { fileSize: this.maxSize }

        });
    }
}

module.exports = FileUploader;