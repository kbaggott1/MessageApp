import './PersonalInfo.css'
import { useState } from 'react';


export function PersonalInfo(props) {
    const [firstName, setFirstName] = useState(null);
    const [lastName, setLastName] = useState(null);
    const [username, setUsername] = useState(null);

    const handleSubmit = async (event) => {
        //Stops the page from re-loading
        event.preventDefault();

        //Setting up the request options
        const requestOptions = {
            method: "put",
            credentials : "include",
            body: JSON.stringify({
                //ADD THE STUFF
            }),
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
            }
        };
        
        const response = await fetch("http://localhost:1339/users", requestOptions)
        const result = await response.json();
        if(response.status === 400){
            //DO SMTH
        }
        if(response.status === 500){
            //DO SMTH ELSE
        }
    }

    return (
        <form onSubmit={handleSubmit} className='ModifyPersonalInfoBox'>
            <label htmlFor='firstName' className='FirstNameAndLastNameSettingsLabel'> First Name </label>
            <label htmlFor='lastName' className='FirstNameAndLastNameSettingsLabel'> Last Name </label>
            <input type="text" placeholder='First Name Goes here'  className='FirstAndLastNameInputBox' onChange={(e) => setFirstName(e.target.value)}/>
            <input type="text" placeholder='Last Name Goes here'  className='FirstAndLastNameInputBox' onChange={(e) => setLastName(e.target.value)}/>


            <label htmlFor='username' className='UsernameInputBoxLabel'> Username </label>
            <br/>
            <input type="text" placeholder='Username Goes here' className='UsernameInputBox' onChange={(e) => setUsername(e.target.value)}/>


        </form>
    )

}