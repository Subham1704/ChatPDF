import multer from "multer";
import path from 'path'
const storage=multer.diskStorage({
    destination:function (req,file,cb) {
        cb(null,'./');
    },
    filename:function (req,file,cb) {
        cb(null,file.fieldname+path.extname(file.originalname));
    }
})
export const upload1=multer({storage});

const upload=multer({
    dest: 'uploads/',
    limits: {fileSize: 5000000, files: 10},
});
export default upload;
// export default upload1;