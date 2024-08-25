import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import { MongoClient } from "mongodb";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";

import pkg from 'faiss-node';
const { IndexFlatL2 } = pkg;

import jwt from 'jsonwebtoken'
import user from "../models/user.js";
import vectorStore from "../models/vectordbs.js";
import ChatHistory from "../models/chatHistory.js";
const llm=new ChatGoogleGenerativeAI({
    apiKey:'AIzaSyCgoe5karNc_99scFGXx4w7Cw_MIdCuCwQ',
    model:'gemini-pro',
    temperature:0.95
})
const modelName = "models/embedding-001";
const embeddings=new GoogleGenerativeAIEmbeddings({apiKey:'AIzaSyCgoe5karNc_99scFGXx4w7Cw_MIdCuCwQ', model:modelName});
const prompt=ChatPromptTemplate.fromTemplate(`
    You have 10+ years of experience at google and you are good at providing answers to questions asked on a given article.
    Provide answers to the question {input} based on the given {context} and keep the answer concise.
    
    If asked for the summary then provide your answer in a way that it covers most of the important information given in the article so that that the user need not go through the entire article.
    Don't give the summary if not asked.
    If you don't know the answer take help from wikipedia and then give answer only for those questions that are relevant to the context and also give your reference in your answer like ref: .
    Give the answer in 2-3 lines only.
`)
const outputParser=new StringOutputParser();
const chain=await createStuffDocumentsChain({
    llm,
    prompt,
    outputParser
})

const client=new MongoClient('mongodb+srv://subham:abc3009@cluster0.cqevyqw.mongodb.net/')
const dbName="PDFsVdb";
const collectionName="pdf-1";
const db=await client.db(dbName);
const collection=db.collection(collectionName);



// const model = SentenceTransformer("hkunlp/instructor-large")
const model = new HuggingFaceTransformersEmbeddings({
    model: "Xenova/all-MiniLM-L6-v2",
});
// const vectors=[];
const dim=384; 

export const storeVectors=async function(splittedDocs){
    const vectors=[];
    for(const sdocs of splittedDocs){
        const vector1=await model.embedDocuments([sdocs.pageContent]);
        console.log(vector1[0]);
        vectors.push(vector1);
    }
    return vectors;
}

async function getRelevantLabels(vectors,q){
    const index=new IndexFlatL2(dim);
    for(const vector of vectors){
        index.add(vector);
    }
    console.log(q);
    let k=vectors.length;
    if(k>5){
        k=5;
    }
    const query=await model.embedQuery(q.question);
    const {distances,labels}=await index.search(query,k);
    return labels;
}

async function getAnswer(vectors,splittedDocs,q){
    const labels=await getRelevantLabels(vectors,q);
    let context=[];
    const doc2=splittedDocs.map((t,indexes)=>{
        if(labels.includes(indexes)){
            context.push(t);
        }
    })
    
    const response=await chain.invoke({
        input:q.question,
        context:context
    })
    console.log(response);
    return response;
}

export const postAns=async function(req,res,next){
    try {
        const question=req.body;
        const token=req.cookies.jwt;
        if(!token){
            throw new Error('Unauthorised')
        }
        const decoded=jwt.verify(token,process.env.TOKEN_KEY);

        const {vector1,text}=await getVectorStore(decoded.userId);
        const answer=await getAnswer(vector1,text,question);
        const user1=await user.findById(decoded.userId);
        const chatHist=await ChatHistory.findOne({
            userId:user1._id,
            pdfName:user1.currentFileName
        })
        const hist=chatHist.messages;
        hist.push({
            AI:answer,
            Human:question.question
        })
        await chatHist.save();
        res.send(answer);
    } catch (error) {
        console.log(error);
    }
}

async function getVectorStore(userId){
    const user1=await user.findById(userId);

    // const vectorStore1=await vectorStore.findOne({
    //     userId:user1._id,
    //     pdfName:user1.currentFileName
    // })

    const vectors=[];
    for(const sdoc of user1.currentFileText){
        const vector1=await model.embedDocuments([sdoc.pageContent]);
        vectors.push(vector1[0]);
    }

    // console.log(vectorStore1.vectors[0]);
    // for(let i=0;i<vectors[0].length;++i){
    //     console.log(vectors[0][i]===vectorStore1.vectors[0][i]);
    //     console.log(i);
    // }
    
    return {
        vector1:vectors,
        text:user1.currentFileText
    };
}
