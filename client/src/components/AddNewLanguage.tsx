import React, {useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export const AddNewLanguage = () => {
    const submitHandler = (event) => {
        event.preventDefault();
        axios.post(`${API_URL}/language`, {
            name: formValues.name,
            code:formValues.code,
            movies:[]
        })
        .then(function (response) {
        })
        .catch(function (response) {
        console.log(response);
        })   
    };

    const [formValues, setFormValues] = useState({
        name: '',
        code:''
    });

    const handleChange= (event) => {
        const {name, value} = event.target;
        setFormValues({...formValues, [name]:value});
    }
    return (
        <div className="main-container">
                <form id="form" onSubmit={submitHandler} autoComplete="off">
        <label htmlFor="name">Name</label>
        <input type="text" name="name" value={formValues.name} onChange={handleChange}/>
        <label htmlFor="code">Code</label>
        <input type="text" name="code" value={formValues.code} onChange={handleChange}/>
        <input type="submit" value="submit" />
       
        </form>
        </div>
    )
}
