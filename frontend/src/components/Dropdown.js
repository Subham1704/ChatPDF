import React, { useState } from 'react'

const Dropdown = (props) => {
    const [isOpen,setIsOpen]=useState(false);
    const [selectedOption,setOption]=useState(null);
    const options=props.files;
    const FileName=props.FileName;
    const toggleOpen=()=>{
        setIsOpen(!isOpen);
    }
    const optionClicked=(option)=>{
        setOption(option);
        FileName(option);
        setIsOpen(false);
    }
  return (
    <div>
        <button onClick={toggleOpen}>
            {selectedOption || 'select a option'}
        </button>
        {isOpen && (
            <ul className='file-List'>
                {options.map((option)=>{
                    return <li className='option' onClick={()=>optionClicked(option)}>{option}</li>
                })}
            </ul>
        )}
    </div>
  )
}

export default Dropdown