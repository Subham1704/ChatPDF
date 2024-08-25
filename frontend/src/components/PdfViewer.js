import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Document, Page } from 'react-pdf';
// import { pdfjs } from 'react-pdf';
// import {GlobalWorkerOptions} from 'pdfjs-dist';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

const PdfViewer = () => {
    const [loading,setLoading]=useState(true);
    const [fileName,setFileName]=useState(null);
    const fetchData=async()=>{
        setLoading(true);
        try {
            const res=await axios.get('http://localhost:4444/getFileName');
            setFileName(res.data);   
            // console.log('pdfData after setting:', pdfData);
        } catch (error) {
            console.log(error);
        }

    }
    useEffect(()=>{
        fetchData();
    },[fileName])
    return (
        <div className="pdf-viewer1">
        <iframe
            // src={`https://storage.cloud.google.com/chat-pdf1/${fileName}`}
            src='https://storage.cloud.google.com/chat-pdf1/2023CML101_QM-tutorial-3.pdf?authuser=1'
            width="40%"
            height="500px" 
            title="Document Viewer"
        />
      </div>
    );
       
}

export default PdfViewer