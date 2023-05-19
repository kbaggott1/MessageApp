import { useContext, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { LoggedInContext, LoggedInUserContext } from "../App.js"
import { useCookies } from 'react-cookie';
import './LoginForm.css';

/**
 * The Login form has two buttons and two input fields. It prompts the user for a username
 * and password. If both the username and password field do not have user input the button
 * to login will be greyed out and will be disabled. Only once they hav entred both a 
 * username and password will it become available to them. At the bottom of the form is a
 * register button which takes them to the register page.
 * @returns JSX component containg a form that prompts the user for a username and password
 */
export function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [ isLoggedin, setIsLoggedIn ] = useContext(LoggedInContext);
    const [ userData, setUserData ] = useContext(LoggedInUserContext);
    const [cookies, setCookie, removeCookie ] = useCookies(['username']);
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const navigate = useNavigate();

    /**
     * Most a POST request to the server to log in the user. If the user is scuccesfully logged
     * in the 'setIsLoggedIn' context is set to true, the 'setUserData' is set to their user 
     * data and they are redirected to the home page of the site.
     * @param {*} event The submit event recieved from the 'LoginInformationBox' form
     */
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const requestOptions = {
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
            
            const response = await fetch("http://localhost:1337/session/login", requestOptions);
            if(response.status === 200){
                alert("Success! You have been logged in");
                const userByUsername = await getUserByUsername(username);
                setUserData(userByUsername);
                setIsLoggedIn(true);
                setCookie('username', username);
                navigate('/');
            }
            else {
                alert("Username or Password are incorrect");
            }
        }
        catch(err){
            alert("Error Loggin in! " + err.message);
        }
    }

    return(
        <>
        <div className='LoginInformationBox'>
            <form onSubmit={handleSubmit}>
                <div className='LoginInputBox'>
                    <label htmlFor='username' className='UsernameAndPasswordSignInLabel'> Username </label>
                    <input type="text" className='UsernameAndPasswordSignInInputBox' placeholder='Username Goes here' onChange={(e) => {setUsername(e.target.value); (e.target.value == "" || password == "") ?  setButtonDisabled(true) : setButtonDisabled(false)}}/>
                    <br/>
                    <br/>
                    <label htmlFor='password' className='UsernameAndPasswordSignInLabel'> Password </label>
                    <input type="password" className='UsernameAndPasswordSignInInputBox' placeholder='Password Goes here' onChange={(e) => {setPassword(e.target.value); (e.target.value == "" || username == "") ?  setButtonDisabled(true) : setButtonDisabled(false)}}/>
                    <br/>
                    <br/>
                    <button type="submit" className={buttonDisabled ? 'ModifyNamesSubmitButtonDisabled' : 'ModifyNamesSubmitButtonActive' } disabled={buttonDisabled}> Log In </button>
                </div>
            </form>

            <br/>
            <br/>
            <div className='DontHaveAnAccountLabel'> Don't have an account? </div>

            <NavLink to="/register">
                <button className='DontHaveAnAccountButton'>
                    Sign Up!
                </button>
            </NavLink>
        </div>
        </>
    )
}


/**
 * Makes a GET request to the server trying to retrieve a user based on their unique username.
 * @param {*} findThisUser The user being searched for.
 * @returns If the user exists an object of the user is returned, if they do not already exist null is returned
 *          and if an error was thrown nothing is return and an alert is shown to the user informing them.
 */
async function getUserByUsername(findThisUser) {
    try {
        const requestOptions = {
            method: "GET",
            credentials: "include",
            mode: 'cors', // this cannot be 'no-cors'
            };
        const response = await fetch("http://localhost:1337/users/"+ findThisUser, requestOptions);
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