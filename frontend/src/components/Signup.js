import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const [username,setUsername]=useState(' ');
    const [password,setPassword]=useState(' ');
    const [email,setEmail]=useState(' ');
    const navigate=useNavigate();
    const SignupPost=async()=>{
        try {
            const resp=await axios.post('http://localhost:4444/postSignup',{
                username,
                email,
                password
            })
            console.log(resp);
            navigate('/');
        } catch (error) {
            alert(error.message);
        }
    }
  return (
    <>
    <div>Signup</div>
    <div>
        <div>Username</div>
        <input type='text' name='username'  onChange={(ev)=>setUsername(ev.target.value)}/>
        <div>Email</div>
        <input type='text' name='email'  onChange={(ev)=>setEmail(ev.target.value)}/>
        <div>password</div>
        <input type='password' name='password'  onChange={(ev)=>setPassword(ev.target.value)}/>
    </div>
    <button onClick={SignupPost}>Submit</button>
    </>
  )
}

export default Signup