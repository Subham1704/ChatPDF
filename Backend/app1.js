const express=require('express');
const app=express();
const multer=require('multer');
const path=require('path');
const PORT=4444;
const cors=require('cors');
const fs=require('fs');
app.use(cors({
    origin:'http://localhost:3000'
}))
app.use(express.urlencoded({extended:true}));
const storage=multer.diskStorage({
    destination:function (req,file,cb) {
        cb(null,'uploads/');
    },
    filename:function (req,file,cb) {
        cb(null,file.fieldname+'-'+Date.now()+path.extname(file.originalname));
    }
})

async function pdfExtract(filePath){
    const d1=fs.readFileSync(filePath);
    const d2=await PDFParser(d1);
    return d2.text;
}
async function summaryFile(data){
    const chain=new Chain();
    chain.extractors([Extractors.Text]);
    chain.summarizers([Summarizers.TextRank]);
    const result=chain.execute(data);
    return result.summarizedContent;
}

const upload=multer({storage:storage});
app.post('/upload',upload.single('file'),async(req,res,next)=>{
    console.log(req.body);
    const d1=await pdfExtract('.uploads\file-1720043073887.txt');
    const data=await summaryFile(d1);
    res.send(data);
})
app.listen(PORT,()=>{
    console.log(`http://localhost:${PORT}`);
})