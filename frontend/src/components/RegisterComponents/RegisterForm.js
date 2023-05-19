import { useContext, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { LoggedInContext, LoggedInUserContext } from "../App.js";
import './RegisterForm.css';

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


    //Handles the request to create a user
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            //create user
            if(await validateInputs(username, password, password2, firstName, lastName, biography)) {
                //login after account created
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
                console.log(response.status);


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
        <>
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


        </>

    )


}

function checkInputsEntered(setButtonDisabled, username, password, password2, firstName, lastName, biography) {
    if(username == "" || password == "" || password2 == "" || biography == "" || firstName == "" || lastName === "") {
        setButtonDisabled(true);
    }
    else {
       setButtonDisabled(false); 
    }

    
}

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