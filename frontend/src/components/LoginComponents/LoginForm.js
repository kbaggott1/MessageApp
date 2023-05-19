import { useContext, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { LoggedInContext, LoggedInUserContext } from "../App.js"
import { useCookies } from 'react-cookie';
import './LoginForm.css';

export function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [ isLoggedin, setIsLoggedIn ] = useContext(LoggedInContext);
    const [ userData, setUserData ] = useContext(LoggedInUserContext);
    const [cookies, setCookie, removeCookie ] = useCookies(['username']);
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const navigate = useNavigate();

    //Handles the request to create a user
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
            console.log(response.status);
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


async function getUserByUsername(findThisUser) {
    try {
        const requestOptions = {
        method: "GET",
        credentials: "include",
        mode: 'cors', // this cannot be 'no-cors'
        };
        const response = await fetch("http://localhost:1337/users/"+ findThisUser, requestOptions);
        const result = await response.json();
        console.log(result);
        return result;
    }
    catch(err) {
        alert("Could not get user: " +findThisUser + " Error: " + err.message);
    }

}