import { useContext, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { LoggedInContext, LoggedInUserContext } from "../App.js";
import './RegisterForm.css';

/**
 * The Registration form contains 6 input fields and two buttons. The user must indicated
 * their username which must be both greater than three characters long as well as no greater
 * than 30 characters long. They must input a password which must be greater than 8 characters
 * long. They must input both a first name and last name and finally a biography. Only once
 * all the fields contain some form of user input will the register button become available to
 * the user. Otherwise it is greyed out and disabled. At the bottom of the page the user is
 * prompted to the press the 'Log In' Button if they already have an account. This button brings
 * them to the 'Log In' Page.
 * @returns JSX Component containing a form prompting the user for a username, password, re-typed password, first
 * name, last name and biography. A button at the buttom prompts the user to Log In if they
 * already have an account 
 */
export function RegisterForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [biography, setBiography] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [ isLoggedin, setIsLoggedIn ] = useContext(LoggedInContext);
    const [ userData, setUserData ] = useContext(LoggedInUserContext);
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const navigate = useNavigate();


    /**
     * Verifies that all inputed user data is valid and conforms to the standards set out
     * on the server. A POST request is then made to the server to create the user. Followed
     * by a POST request to login in the newly created user. If both operations were successful
     * the now logged in user is redirected the home page. They will then have access to other,
     * previously unavailable pages such as messages and settings.
     * @param {*} event The submit event from the 'SignUpInformationBox' form.
     */
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            if(await validateInputs(username, password, password2, firstName, lastName, biography)) {
                //create user
                let requestOptions = {
                    method: "POST",
                    credentials: "include",
                    mode: 'cors', // this cannot be 'no-cors'
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                        status: "online",
                        firstName: firstName,
                        lastName: lastName,
                        biography: biography,
                        image: "placeholder"
                    }),

                };
                let response = await fetch("http://localhost:1337/users/", requestOptions);
                if(response.status === 200){
                    alert("Successfully created an account!");
                }


                //login after account created
                requestOptions = {
                    method: "POST",
                    credentials: "include",
                    mode: 'cors', // this cannot be 'no-cors'
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                    }),

                };
            
                response = await fetch("http://localhost:1337/session/login", requestOptions);
                if(response.status === 200){
                    alert("Success! You have been logged in");
                    const userByUsername = await getUserByUsername(username);
                    setUserData(userByUsername);
                    setIsLoggedIn(true);
                    navigate('/');
                }
                console.log(response.status);
            }
        }
        catch(err){
            alert("Error Loggin in! " + err.message);
        }

    }

    return(
        <form onSubmit={handleSubmit} className='SignUpInformationBox'>
            <label htmlFor='username' className='RegistrationHeaderLabels'> Username </label>
            <input type="text" className='RegistrationInputBox' placeholder='Username...' onChange={(e) => {setUsername(e.target.value); checkInputsEntered(setButtonDisabled, e.target.value, password, password2, firstName, lastName, biography)}}/>
            
            <label htmlFor='password' className='RegistrationHeaderLabels'> Password </label>
            <input type="password" className='RegistrationInputBox' placeholder='Password...' onChange={(e) => {setPassword(e.target.value); checkInputsEntered(setButtonDisabled, username, e.target.value, password2, firstName, lastName, biography)}}/>
            
            <label className='RegistrationHeaderLabels'> Re-type  Password</label>
            <input type="password" className='RegistrationInputBox' placeholder='Re-type password...' onChange={(e) => {setPassword2(e.target.value); checkInputsEntered(setButtonDisabled, username, password, e.target.value, firstName, lastName, biography)}}/>
            
            <label className='RegistrationHeaderLabels'> First Name </label>
            <input type="text" className='RegistrationInputBox' placeholder='First Name' onChange={(e) => {setFirstName(e.target.value); checkInputsEntered(setButtonDisabled, username, password, password2, e.target.value, lastName, biography)}}/>
                
            <label className='RegistrationHeaderLabels'> Last Name </label>
            <input type="text" className='RegistrationInputBox' placeholder='Last Name' onChange={(e) => {setLastName(e.target.value); checkInputsEntered(setButtonDisabled, username, password, password2, firstName, e.target.value, biography)}}/>

            <label className='RegistrationHeaderLabels'> Biography </label>
            <input type="text" className='RegistrationInputBox' placeholder='Biography' onChange={(e) => {setBiography(e.target.value); checkInputsEntered(setButtonDisabled, username, password, password2, firstName, lastName, e.target.value)}}/>
            <br/>

            <button type="submit" className={buttonDisabled ? 'RegistrationSubmitButtonDisabled' : 'RegistrationSubmitButtonActive' } disabled={buttonDisabled}> Register </button>
            
            <div className='IAlreadyHaveAnAccountLabel'>
                Press 'Log In' If You Have An Account
            </div>

            <div className='BoxAroundTheIAlreadyHaveAnAccountButton'>
            <NavLink to="/login">
                <button className='AlreadyHaveAnAccountButton'>
                    Log In
                </button>
            </NavLink>
            </div>
        </form>
    )
}

/**
 * Verifies that all provided inputs are not empty strings. If any one of the parameters provided are an empty string
 * the 'setButtonDisabled' react hook is set to false, otherwise it is set to true.
 * @param {*} setButtonDisabled A React Hook that is set to false if any one of the other values is an empty string
 * @param {*} username Username being verified.
 * @param {*} password Password being verified.
 * @param {*} password2 Re-typed password being verified.
 * @param {*} firstName First name being verified.
 * @param {*} lastName Last name being verified.
 * @param {*} biography Biography being verified.
 */
function checkInputsEntered(setButtonDisabled, username, password, password2, firstName, lastName, biography) {
    if(username == "" || password == "" || password2 == "" || biography == "" || firstName == "" || lastName === "") {
        setButtonDisabled(true);
    }
    else {
       setButtonDisabled(false); 
    }
}


/**
 * Verifies that the provided data is valid. If any of the data provided is false, a corresponding error message
 * is shown to the user and alert and a value of false is returned to indicated failure.
 * @param {string} username Username of the user attempting to register. Must be greater than 3 characters long
 *                          as well as less than 30 characetrs long. Username cannot already be taken as it must
 *                          be unique to every individual user       
 * @param {string} password Password of the user attmepting to register. Must be greater than 9 characters long.
 * @param {string} password2 Re-typed password  of the user attmepting to register. Must be the exact 
 *                           same string as the password parameter                     
 * @param {string} firstName First Name of the user attmepting to register. Cannot contain numbers.
 * @param {string} lastName Last Name of the user attmepting to register. Cannot contain numbers.
 * @param {string} biography Biography of the user attmepting to register. Cannot be an empty string.
 * @returns {boolean} Returns true if all parameter values are valid, false otherwise.
 */
async function validateInputs(username, password, password2, firstName, lastName, biography) {
    if(await getUserByUsername(username)) {
        alert("Username already taken.");
        return false;
    }

    if(username == "") {
        alert("Username cannot be empty.");
        return false;
    }
    if(username.length < 3 || username.length > 30) {
        alert("username must be between 3 and 30 characters long.");
        return false;
    }
    if(password.length < 8) {
        alert("password must be atleast 8 characters long.");
        return false;
    }
    if(password != password2) {
        alert("Passwords don't match");
        return false;
    }
    if(firstName == "") {
        alert("First name cannot be empty");
        return false;
    }
    if(lastName == "") {
        alert("Last name cannot be empty");
        return false;
    }
    if(biography == "") {
        alert("Biography cannot be empty");
        return false;
    }
    return true;
}


/**
 * Makes a GET request to the server trying to retrieve a user based on their unique username.
 * @param {*} findThisUser The user being searched for.
 * @returns If the user exists an object of the user is returned, if they do not already exist null is returned
 *          and if an error was thrown nothing is return and an alert is shown to the user informing them.
 */
async function getUserByUsername(findThisUser) {
    try {
        const response = await fetch("http://localhost:1337/users/"+ findThisUser);
        if(response.status === 200) {
            const result = await response.json();
            return result;  
        }
        else {
            return null;
        }
    }
    catch(err) {
        alert("Could not get user: " + err.message);
    }
}