import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username,setUsername]=useState(' ');
    const [password,setPassword]=useState(' ');
    const navigate=useNavigate();
    const LoginSubmit=async()=>{
        const options = {
            url: 'http://localhost:4444/postLogin',
            method: 'POST',
            withCredentials: true,
            data:{
                username,
                password
            }
        }
        try {
            // const resp=await axios.post('http://localhost:4444/postLogin',{
            //     username,
            //     password
            // })
            const resp=await axios(options);
            console.log(resp);
            const fileList=await axios.get('http://localhost:4444/getFileList');
            if(fileList.data.length===0){
                navigate('/upload');
            }
            else{
                navigate('/qans');
            }
            // navigate('/upload');
        } catch (error) {
            alert(error.message);
        }
        
    }
    

  return (
    <>
        <div>
            <div>Username/ email</div>
            <input type='text' name='username'  onChange={(ev)=>setUsername(ev.target.value)}/>
            <div>password</div>
            <input type='password' name='password'  onChange={(ev)=>setPassword(ev.target.value)}/>
        </div>
        <button type='submit' onClick={LoginSubmit}>Submit</button>
        <div>
            <span>Or signup</span>
            <button onClick={()=>navigate('/signup')}>signup</button>
        </div>
    </>
  )
}

export default Login