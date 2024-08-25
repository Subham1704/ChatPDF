import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { RecursiveCharacterTextSplitter, TextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import fs from 'fs'
import ChatHistory from "../models/chatHistory.js";
const model=new ChatGoogleGenerativeAI({
    apiKey:'AIzaSyCgoe5karNc_99scFGXx4w7Cw_MIdCuCwQ',
    model:'gemini-pro',
    temperature:0.95
})
const embeddings=new GoogleGenerativeAIEmbeddings({apiKey:'AIzaSyCgoe5karNc_99scFGXx4w7Cw_MIdCuCwQ', model:"models/embedding-001"});

const prompt=ChatPromptTemplate.fromTemplate(`
    You have 10+ years of experience at google and you are good at providing answers to questions asked on the given article.
    Provide answers to questions {input} based on the given {context} and keep the answer concise.

    If asked particularly for the summary then provide your answer in a way that it covers most of the important information given in the article so that the user need not go through the entire article and also provide important points in bullets and at the end give atlest 2-3 questions that a user can ask from the {context}
    Give questions at the end only if asked for it.
    Give your response in human readable form.

`)
const outputParser=new StringOutputParser();
const chain=await createStuffDocumentsChain({
    llm:model,
    prompt,
    outputParser
})

export const multiplePdfs=async function(uploadedFiles) {
    try {
        console.log("hello1");
        console.log(uploadedFiles);
        if(!uploadedFiles || uploadedFiles.length==0){
            res.status(200).json({
                message:'no pdf is uploaded'
            })
        }
        const vectorstores=[];
        let indx=0;
        for(const file of uploadedFiles){
            console.log();
            // const pdfBuffer=fs.readFileSync(file.path);
            console.log(3);
            const loader=new PDFLoader(file.path);
            const doc=await loader.load();
            const text_splitter=new RecursiveCharacterTextSplitter({chunkSize:1000,chunkOverlap:0});
            const splittedDocs=await text_splitter.splitDocuments(doc);
            //const vectorStore=await MemoryVectorStore.fromDocuments(splittedDocs,embeddings);
            const vectorStore=await FaissStore.fromDocuments(splittedDocs,embeddings);
            console.log(2);
            vectorstores.push(vectorStore);
            await vectorStore.save(`./uploads/${indx}`,'vectors');   
            fs.unlinkSync(file.path);
            // let hist=await ChatHistory.create({
            //     pdfNo:indx,
            //     messages:[]
            // })
            indx+=1;
        }
        console.log(4);
        // await vectorstores.save('./uploads','vectors');
        console.log(5);
        return {a:1};

    } catch (error) {
        throw new Error("error while uploading the files")
    }
}




export const loader1=async function() {
    const loader=new PDFLoader('file.pdf');
    const doc=await loader.load();
    const text_splitter=new RecursiveCharacterTextSplitter({chunkSize:1000,chunkOverlap:0});
    const splittedDocs=await text_splitter.splitDocuments(doc);
    //const vectorStore=await MemoryVectorStore.fromDocuments(splittedDocs,embeddings);
    const vectorStore=await FaissStore.fromDocuments(splittedDocs,embeddings);
    await vectorStore.save('./uploads','vectors');   

    return 1;
}


export const postAns=async function(req,res,next){
    try {
        const {indx}=req.body;
        const loadedVectorStore=await FaissStore.load(`./uploads/${indx}`,embeddings);
        const retriever=loadedVectorStore.asRetriever();
        const retrievalChain=await createRetrievalChain({
            combineDocsChain:chain,
            retriever,
        })
        const {question}=req.body;
        console.log(question);
        const response=await retrievalChain.invoke({
            input:question
        })
        console.log(response.answer);
        let hist=await ChatHistory.findOne({
            pdfNo:indx
        })
        if(hist){
            hist.messages.push({
                AI:response.answer,
                Human:question,
            })
        }
        else{
            hist=await ChatHistory.create({
                pdfNo:indx,
                messages:[
                    {
                        AI:response.answer,
                        Human:question,
                    }
                ]
            })
        }
        await hist.save();
        res.send(response.answer);
    } catch (error) {
        console.log(error);
    }
}


export const getChatHistory=async function(req,res,next) {
    const {pdfNo}=req.params;
    const hist=await ChatHistory.findOne({
        pdfNo
    })
    
    if(hist){
        console.log(hist.messages);
        res.send({message:hist.messages});
    }
    else{
        res.send([]);
    }

}



export const uploadSinglePdf=async function(index){
    try {
        const loader=new PDFLoader('file.pdf');
        const doc=await loader.load();
        const text_splitter=new RecursiveCharacterTextSplitter({chunkSize:1000,chunkOverlap:0});
        const splittedDocs=await text_splitter.splitDocuments(doc);
        //const vectorStore=await MemoryVectorStore.fromDocuments(splittedDocs,embeddings);
        const vectorStore=await FaissStore.fromDocuments(splittedDocs,embeddings);
        await vectorStore.save(`./uploads/${index}`,'vectors');   
        return 1;
    } catch (error) {
        console.log(error);
        return 0;
    }
    
}