import './PersonalInfo.css'
import { useContext, useState } from 'react';
import { LoggedInContext, LoggedInUserContext } from "../App.js"

export function PersonalInfo(props) {
    const [firstName, setFirstName] = useState(null);
    const [lastName, setLastName] = useState(null);
    const [username, setUsername] = useState(null);
    const [ userData, setUserData ] = useContext(LoggedInUserContext);

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
            <input type="text" placeholder={userData.firstName}  className='FirstAndLastNameInputBox' onChange={(e) => setFirstName(e.target.value)}/>
            <input type="text" placeholder={userData.lastName}  className='FirstAndLastNameInputBox' onChange={(e) => setLastName(e.target.value)}/>


            <label htmlFor='username' className='UsernameInputBoxLabel'> Username </label>
            <br/>
            <input type="text" placeholder={userData.username}  className='UsernameInputBox' onChange={(e) => setUsername(e.target.value)}/>
        </form>
    )

}