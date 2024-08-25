import React, { useEffect, useRef, useState } from 'react'
import Loading from './Loading';
import axios from 'axios';
import PdfViewer from './PdfViewer';
import Dropdown from './Dropdown';
import { Link, useNavigate } from 'react-router-dom';

const Chatting = () => {
    const [isLoading,setIsLoading]=useState(false);
    const [fileName,setFileName]=useState('');
    const [files,setFiles]=useState([]);
    const navigate=useNavigate();
    const ques=useRef(null);
    useEffect(()=>{
        (async()=>{
            try {
                const res=await axios.get('http://localhost:4444/getFileName');
                console.log(res);
                
                const res1=await axios.get('http://localhost:4444/getFileList');
                console.log(res1);
                setFileName(res.data); 
                setFiles(res1.data);
            } catch (error) {
                console.log(error);
            }
            
        })();


    },[])

    

    useEffect(()=>{
        if(fileName!==''){
            (async()=>{
                console.log(files);
                let hist=[];
                
                console.log("filename:",fileName);
                let resp=await axios.post('http://localhost:4444/changeFile',{
                    fileName
                })
                console.log(resp);
                let message=await axios.get(`http://localhost:4444/getChatHistory`);
                if(message!==undefined){
                    console.log(message);
                    hist=message.data;
                }
            
                console.log(hist);
                let message1=document.getElementById('message');
                message1.innerText="";
                if(hist.length===0){
                    let output=document.createElement('div');
                    //message.appendChild(inputq);
                    setIsLoading(true);
                    (async () => {

                        const resp=await axios.post('http://localhost:4444/postAns',{
                            question:'give a short summary of the given context?',
                        });
                        setIsLoading(false);
                        output.innerText=`
                        Hello and Welcome to Chatpdf!
                        Below is the summary for your pdf:

                        ${resp.data}
                        `;
                    })();
                    setIsLoading(false);
                    output.classList.add('outputPrompt');
                    message1.appendChild(output);
                }
                else{
                    console.log(hist);
                    hist.map((b,index11)=>{
                        // let message=document.getElementById('message');
                        console.log(b.Human);
                        if(index11!==0){
                            let inputq=document.createElement('div');
                            inputq.innerText=b.Human;
                            inputq.classList.add('inputPrompt');
                            message1.appendChild(inputq);
                        }
                        console.log(b.AI);
                        let output=document.createElement('div');
                        output.innerText=b.AI;
                        output.classList.add('outputPrompt');
                        message1.appendChild(output);
                        
                    })

                }
            })();
        }
        
    }, [fileName])

    async function askQ(ev){
        setIsLoading(true);
        const question=ques.current.value;
        ques.current.value="";
        let inputq=document.createElement('div');
        inputq.innerText=question;
        inputq.classList.add('inputPrompt');
        ev.preventDefault();
        //let chatBox=document.querySelector('.chat');
        // chatBox.appendChild(inputq);
        let message=document.getElementById('message');
        message.appendChild(inputq);
        const resp=await axios.post('http://localhost:4444/postAns',{
            question:question
        });
        console.log(resp);
        setIsLoading(false);
        // let out1=document.getElementById('out');
        let output=document.createElement('div');
        output.innerText=resp.data;
        output.classList.add('outputPrompt');
        message.appendChild(output);
        // setAns(resp.data);
        console.log(resp.data);
    }
    async function logout(ev){
        ev.preventDefault();
        navigate('/');
        // document.cookie='jwt=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        const randomString = Math.random().toString(36).substring(2, 15); // Generate a random string
        document.cookie = `jwt=${randomString}; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }

  return (
    <>
    <div className='Box'>
        <button onClick={logout}>Logout</button>
        <div className='title1'>
            <h1>Chat with your pdfs</h1>

            <h2>Currently on pdf: {fileName}</h2>
            
        </div>
        <div className='fileList'>
            <span>
                Choose File: <Dropdown files={files}  FileName={(d)=>setFileName(d)}/>
            </span>
            
            <Link to='/upload'><button>Add File</button></Link>

        </div>
        <div className='box1'>
            <div className="pdf-viewer1">
                <iframe
                    // src={`https://storage.cloud.google.com/chat-pdf1/${fileName}`}
                    src={`https://storage.cloud.google.com/chat-pdf1/${fileName}?authuser=1`}
                    width="98%"
                    height="650px" 
                    title="Document Viewer"
                />
            </div>
            <div className='box2'>
                <div className='chat'>
                    <div id='message'></div>
                    {isLoading? <Loading/>:<div/>}
                    {/* <div id='out'></div> */}
                
                </div>
                <div className='sendBar'>
                    <input type='text' ref={ques} placeholder='enter your question' className='inputBar'/>
                    <button onClick={askQ} className='sendBtn'>ASK</button>
                </div>
            </div>
        </div>
    </div>
    </>
  )
}

export default Chatting