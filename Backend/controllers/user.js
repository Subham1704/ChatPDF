import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RetrievalQAChain, loadSummarizationChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { pull } from "langchain/hub";
import path from 'path'
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

const model=new ChatGoogleGenerativeAI({
    apiKey:'AIzaSyCgoe5karNc_99scFGXx4w7Cw_MIdCuCwQ',
    model:'gemini-pro',
    temperature:0.95
})
const embeddings=new GoogleGenerativeAIEmbeddings({apiKey:'AIzaSyCgoe5karNc_99scFGXx4w7Cw_MIdCuCwQ', model:"models/embedding-001"});
function loader1() {
    
}
const loader=new PDFLoader('\applsci-07-01163-v2.pdf');
const pages=await loader.load();
const text_splitter=new RecursiveCharacterTextSplitter({chunkSize:1000,chunkOverlap:0});
const data=await text_splitter.splitDocuments(pages);
//console.log("data:",data);
const prompt=await pull("rlm/rag-prompt");

// const chain=await createStuffDocumentsChain({
//     llm:model,
//     outputParser:new StringOutputParser,
//     prompt
// })
//const question="Give me some questions that one can ask from this article";
const vectorStore=await FaissStore.fromDocuments(data,embeddings);
//console.log(data);
const dir='./uploads'
await vectorStore.save(dir);
const loadedVectorStore=await FaissStore.load(dir,embeddings);
const chain=RetrievalQAChain.fromLLM(model,loadedVectorStore.asRetriever(),prompt);

//const res=await chain.invoke({query:question});
//console.log(res);

export const postAns=async function(req,res,next){
    try {
        const question=req.body;
        console.log(question);
        const resp=await chain.invoke({query:question});
        console.log(resp);
        res.send(resp);
    } catch (error) {
        console.log(error);
    }
}



