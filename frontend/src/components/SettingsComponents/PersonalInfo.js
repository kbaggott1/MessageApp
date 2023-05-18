import './PersonalInfo.css'
import { useContext, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { LoggedInContext, LoggedInUserContext } from "../App.js"

export function PersonalInfo(props) {
    const [ userData, setUserData ] = useContext(LoggedInUserContext);
    const [firstName, setFirstName] = useState(userData.firstName);
    const [lastName, setLastName] = useState(userData.lastName);
    const [username, setUsername] = useState(userData.username);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        //Stops the page from re-loading
        event.preventDefault();

        let modifedUsername = userData.username;
        let modifiedFirstName = userData.firstName;
        let modifedLastName = userData.lastName;
        if(username != undefined && username != null && username != "" && username != " "){
            modifedUsername = username;
        }
        if(firstName != undefined && firstName != null && firstName != "" && firstName != " "){
            modifiedFirstName = firstName;
        }
        if(lastName != undefined && lastName != null && lastName != "" && lastName != " "){
            modifedLastName = lastName
        }

        //Setting up the request options
        const requestOptions = {
            method: "PUT",
            credentials : "include",
            body: JSON.stringify({
                userId: userData._id,
                username: userData.username,
                password: userData.password,
                status: userData.status,
                firstName: modifiedFirstName,
                lastName: modifedLastName,
                biography: userData.biography,
                image: userData.image,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        const response = await fetch("http://localhost:1337/users/", requestOptions)
        const result = await response.json();
        if(response.status === 200){
            setUserData(result);
            navigate('/');
            navigate('/settings');//Doing this to 'refresh' the page
        }
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
            <input type="text" placeholder={userData.username}  className='UsernameInputBox' onChange={(e) => setUsername(e.target.value)}/>

            <button type="submit" className='ModifyNamesSubmitButton'> Modify Settings </button>
        </form>
    )

}