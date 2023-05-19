import './PersonalInfo.css'
import { useContext, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { LoggedInContext, LoggedInUserContext } from "../App.js"

/**
 * The PersonalInfo form contains 4 fields which the user can modify username, first name
 * last name and biography. These fields will contain the users current data for these
 * fields as their placeholders. When any of the data is modified the placeholder changes
 * to the new modified data. The 'Modify Settings' submit button only becomes enabled
 * when at least one of the fields has been modified
 * @returns A form that contains the user's first name, last name, username and biography
 * and prompts them to change of one or multiple of these fields.
 */
export function PersonalInfo() {
    const [ userData, setUserData ] = useContext(LoggedInUserContext);
    const [ isLoggedin, setIsLoggedIn ] = useContext(LoggedInContext);
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [biography, setBiography] = useState("");
    const navigate = useNavigate();


    /**
     * Checks which fields, if any, have been modified and makes a PUT request to the server
     * which contains the previous user values as well as any new values the user wished to
     * update. If a response status of 200 is recieved, an alert indicating success is shown
     * to the user, if a response of 401 is recieved, the user is logged out of the account,
     * if a response of 500 is recieved an error message indicating database issues is shown
     * to the user, for any other response a generic error message is shown. If an error is
     * thrown, it means the user's session has expired and they are logged out.
     * @param {*} event The submit event sent from the 'ModifyPersonalInfoBox' form.
     */
    const handleSubmit = async (event) => {
        try {
            //Stops the page from re-loading
            event.preventDefault();

            //Checking for empty values
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
            
            //Alert the user if they have made a mistake
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
                    alert("Your session has expired! Please Login again to continue. Your Information has Not been modified")
                    setUserData(null);
                    setIsLoggedIn(false);
                    navigate('/');
                }
                else if(response.status === 500){
                    alert("There was an error conecting the Database. Please try again later. Your Information has Not been modified")
                }
                else {//SHOULD WE CHANGE THIS?
                    alert("You inputed the same user data already present. Therefore nothing was modified.")
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

/**
 * Verifies that the username, biography, firstName and lastName parameters are not empty strings.
 * If any of them are emtpry string the 'setButtonDisabled' react hook is set to the false.\
 * Otherwise, as in if none are empty strings. It is set to true.
 * @param {*} setButtonDisabled React hook that is set to false if there are invalid values
 * @param {*} username Username of the user that is trying to update their user data.
 * @param {*} firstName First name of the user that is trying to update their user data.
 * @param {*} lastName Last name of the user that is trying to update their user data.
 * @param {*} biography Biography of the user that is trying to update their user data.
 */
function checkInputsEntered(setButtonDisabled, username, firstName, lastName, biography) {
    if(username == "" && biography == "" && firstName == "" && lastName == "") {
        setButtonDisabled(true);
    }
    else {
       setButtonDisabled(false); 
    }
}