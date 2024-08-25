import axios from 'axios';
import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Upload = () => {
    const [newFile,setNewFile]=useState(null);
    const navigate=useNavigate();
    let NewFileUpload=useRef(null);
    function changeNewFile(ev){
        console.log(ev.target.files[0]);
        setNewFile(ev.target.files[0]);
    }
    async function AddFile(ev){
        ev.preventDefault();
        try {
            const form=new FormData();
            form.append('file',newFile);
            console.log(newFile);
            const resp=await axios.post('http://localhost:4444/uploadSinglePdf',form,{
                headers: {
                    "Content-Type": "multipart/form-data",
                  }
            });
            console.log(resp);
            NewFileUpload=null;
            navigate('/qans');

        } catch (error) {
            console.log(error);
        }

    }

  return (
    <>
        <div>
            <span>Add a file  :   </span>
            <form>
                <input type='file' name='file' onChange={changeNewFile} ref={NewFileUpload}/>
                <button onClick={AddFile}>add</button>
            </form>
        </div>
    </>
  )
}

export default Upload