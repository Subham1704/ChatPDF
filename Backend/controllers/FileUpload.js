import { Storage } from '@google-cloud/storage';
import pkg from '@google-cloud/vision';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import axios from 'axios';
import pkg1 from 'file-reader';
const { file } = pkg1;
import fs from 'fs'
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { VertexAI } from "@langchain/google-vertexai";
const storage=new Storage({
    projectId:"eloquent-altar-429710-m0",
    keyFilename:"eloquent-altar-429710-m0-37b5657a67c1.json"
})

const modelName="text-bison@001";
// const vertexai=new VertexAI({"api_key":"AIzaSyCgoe5karNc_99scFGXx4w7Cw_MIdCuCwQ","model":"text-bison@001","platform_type":"gcp"});

async function createClient(){
    const { v1 } = pkg;
    const client=new v1.ImageAnnotatorClient({
        projectId:"eloquent-altar-429710-m0",
        keyFilename:'eloquent-altar-429710-m0-37b5657a67c1.json'
    });
    return client
}
const client=await createClient();

export const uploadStorage=async(fileName)=>{
    try {
        const gcs=storage.bucket("chat-pdf1");
        const result=await gcs.upload('file.pdf',{
            destination:fileName,
            metadata:{
                contentType:'application/pdf'
            }
        })
        console.log(result);
        const loader=new PDFLoader('file.pdf');
        const data=await loader.load();
        const text_splitter=new RecursiveCharacterTextSplitter({chunkSize:1000,chunkOverlap:0});
        const splittedDocs=await text_splitter.splitDocuments(data);
        return splittedDocs;
    } catch (error) {
        console.log(error);
    }
}




const getRes=async (fileName)=>{
    const url=`gs://chat-pdf1/${fileName}`
    const request={
        requests:[
            {
                features:[{type:'DOCUMENT_TEXT_DETECTION'}],
                inputConfig:{
                    mimeType:'application/pdf',
                    gcsSource:{uri:url}
                },
                outputConfig: {
                    gcsDestination: {uri:''},
                }
            }
        ]
    }

    const response=await client.batchAnnotateFiles(request);
    return response;
}
export const getText=async(fileName)=>{
    try {
        const [response]=await getRes(fileName);
        console.log(response);
        let extractedText='';
        const [resp]=response.responses;
        console.log(resp);
        const arr=resp.responses;
        console.log(arr);
        for(const a of arr){
            extractedText+=a.fullTextAnnotation.text;
        }
        fs.writeFileSync('extracted-text.txt',extractedText);
        console.log("extracted:",extractedText);
        const splittedDocs=await getSplittedDocs(extractedText);
        // fs.unlinkSync('extracted-text.txt');

        return splittedDocs;
    } catch (error) {
        console.log('error while getting text from uploaded files.')
    }
}
async function getSplittedDocs(extractedText){
    const loader=new TextLoader('extracted-text.txt');

    const doc=await loader.load();
    console.log(doc);
    const text_splitter=new RecursiveCharacterTextSplitter({chunkSize:1000,chunkOverlap:0});
    const splittedDocs=await text_splitter.splitDocuments(doc);
    console.log(splittedDocs);
    return splittedDocs;
}

