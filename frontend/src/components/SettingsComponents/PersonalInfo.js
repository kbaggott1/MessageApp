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
            <div className='FirstAndLastNameInputBox'>
                <label htmlFor='firstName'> First Name </label>
                <input type="text" placeholder='First Name Goes here' onChange={(e) => setFirstName(e.target.value)}/>

                <label htmlFor='lastName'> Last Name </label>
                <input type="text" placeholder='Last Name Goes here' onChange={(e) => setLastName(e.target.value)}/>
            </div>

            <div>
                <div className='UsernameInputBoxLabel'>
                <label htmlFor='username'> Username </label>
                </div>
                <input type="text" placeholder='Username Goes here' className='UsernameInputBox' onChange={(e) => setUsername(e.target.value)}/>
            </div>

        </form>
    )

}