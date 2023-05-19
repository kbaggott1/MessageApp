import './PersonalInfo.css'
import { useContext, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { LoggedInContext, LoggedInUserContext } from "../App.js"

export function PersonalInfo(props) {
    const [ userData, setUserData ] = useContext(LoggedInUserContext);
    const [ isLoggedin, setIsLoggedIn ] = useContext(LoggedInContext);
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [biography, setBiography] = useState("");
    const navigate = useNavigate();


    const handleSubmit = async (event) => {
        try {
            //Stops the page from re-loading
            event.preventDefault();


            let modifedUsername = userData.username;
            let modifiedFirstName = userData.firstName;
            let modifedLastName = userData.lastName;
            let modifiedBiography = userData.biography;
            if(username != ""){
                modifedUsername = username;
            }
            if(firstName != ""){
                modifiedFirstName = firstName;
            }
            if(lastName != ""){
                modifedLastName = lastName;
            }
            if(biography != ""){
                modifiedBiography = biography;
            }
            

            if((modifedUsername != userData.username) && (modifedUsername.length < 3 || modifedUsername.length > 30)) {
                alert("username must be between 3 and 30 characters long.");
            }
            else {
                //Setting up the request options
                const requestOptions = {
                    method: "PUT",
                    credentials : "include",
                    body: JSON.stringify({
                        userId: userData._id,
                        username: modifedUsername,
                        password: userData.password,
                        status: userData.status,
                        firstName: modifiedFirstName,
                        lastName: modifedLastName,
                        biography: modifiedBiography,
                        image: userData.image,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };
            
                const response = await fetch("http://localhost:1337/users/", requestOptions)
                const result = await response.json();
                console.log(response.status);

                if(response.status === 200){
                    setUserData(result);
                    alert("Successfully updated user data!");
                }
                else if(response.status === 401){
                    alert("Your session has expired! Please Login again to continue")
                    setUserData(null);
                    setIsLoggedIn(false);
                    navigate('/');
                }
                else {
                    alert("Invalid Input, first Name and last Name cannot contain numbers or symbols.")
                }
            }
            
            


            
        }catch(err){
            alert("Your session has expired! Please Login again to continue")
            setUserData(null);
            setIsLoggedIn(false);
            navigate('/login');
        }
    }

    return (
        <form onSubmit={handleSubmit} className='ModifyPersonalInfoBox'>
            <label htmlFor='firstName' className='FirstNameAndLastNameSettingsLabel'> First Name </label>
            <label htmlFor='lastName' className='FirstNameAndLastNameSettingsLabel'> Last Name </label>
            <input type="text" placeholder={userData.firstName}  className='FirstAndLastNameInputBox' onChange={(e) => {setFirstName(e.target.value); checkInputsEntered(setButtonDisabled, username, e.target.value,  lastName,  biography)}}/>
            <input type="text" placeholder={userData.lastName}  className='FirstAndLastNameInputBox' onChange={(e) => {setLastName(e.target.value); checkInputsEntered(setButtonDisabled, username,  firstName, e.target.value,  biography)}}/>

            <label htmlFor='username' className='UsernameInputBoxLabel'> Username </label>
            <input type="text" placeholder={userData.username}  className='UsernameInputBox' onChange={(e) => {setUsername(e.target.value); checkInputsEntered(setButtonDisabled, e.target.value,  firstName,  lastName,  biography)}}/>

            <label htmlFor='biography' className='BiographyInputBoxLabel'> Biography </label>
            <input type="text" placeholder={userData.biography}  className='BiographyInputBox' onChange={(e) => {setBiography(e.target.value); checkInputsEntered(setButtonDisabled, username,  firstName,  lastName, e.target.value)} }/>

            <button type="submit" className={buttonDisabled ? 'ModifyNamesSubmitButtonDisabled' : 'ModifyNamesSubmitButtonActive' } disabled={buttonDisabled}> Modify Settings </button>
        </form>
    )

}

function checkInputsEntered(setButtonDisabled, username, firstName, lastName, biography) {
    if(username == "" && biography == "" && firstName == "" && lastName == "") {
        setButtonDisabled(true);
    }
    else {
       setButtonDisabled(false); 
    }

    
}