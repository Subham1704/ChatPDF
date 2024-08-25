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
const summaryTemplate = `
You are an expert in summarizing these types of articles.
Your goal is to create a summary ofthis article.

Total output will be a summary of the article and a list of example questions the user could ask of the article.

SUMMARY AND QUESTIONS:
`;

const embeddings=new GoogleGenerativeAIEmbeddings({apiKey:'AIzaSyCgoe5karNc_99scFGXx4w7Cw_MIdCuCwQ', model:"models/embedding-001"});
export const loader1=async function() {
    const loader=new PDFLoader('file.pdf');
    const pages=await loader.load();
    console.log(2);
    const text_splitter=new RecursiveCharacterTextSplitter({chunkSize:1000,chunkOverlap:0});
    const data=await text_splitter.splitDocuments(pages);
    //console.log("data:",data);
    const vectorStore=await FaissStore.fromDocuments(data,embeddings);
    console.log(1);
    const dir='./uploads'
    await vectorStore.save(dir); 
    const SUMMARY_PROMPT = PromptTemplate.fromTemplate(summaryTemplate);
    const res=loadSummarizationChain(model, {
        type: "refine",
        verbose: false,
        questionPrompt: SUMMARY_PROMPT
    });
    console.log(3);
    const summ=await res.invoke({
        input_documents:data,
    });
    console.log(4);
    const summ1=summ.output_text;
    fs.writeFile('summary.txt',summ1, (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        console.log('File was written successfully.');
    });
    return 1;
}

// const loadedVectorStore=await FaissStore.load('./uploads',embeddings);
// if(!loadedVectorStore){
//     loader1();
// }

export const postAns=async function(req,res,next){
    try {
        const loadedVectorStore=await FaissStore.load('./uploads',embeddings);
        const prompt=await pull("rlm/rag-prompt");
        const chain=RetrievalQAChain.fromLLM(model,loadedVectorStore.asRetriever(),prompt);
        const question=req.body;
        console.log(question.question);
        const resp=await chain.invoke({query:question.question});
        console.log(resp);
        res.send(resp);
    } catch (error) {
        console.log(error);
    }
}

export const getSummary=async function(req,res){
    res.send(summ);
}

