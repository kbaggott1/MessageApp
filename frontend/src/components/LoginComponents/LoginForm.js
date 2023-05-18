import { useContext, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { LoggedInContext, LoggedInUserContext } from "../App.js"

export function LoginForm() {
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [ isLoggedin, setIsLoggedIn ] = useContext(LoggedInContext);
    const [ userData, setUserData ] = useContext(LoggedInUserContext);
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
                console.log(response);
                const userByUsername = await getUserByUsername(username);
                setUserData(userByUsername);
                setIsLoggedIn(true);
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
        <form onSubmit={handleSubmit}>
            <div className='LoginInputBox'>
                <label htmlFor='username'> Username </label>
                <input type="text" placeholder='Username Goes here' onChange={(e) => setUsername(e.target.value)}/>
                <br/>
                <label htmlFor='password'> Password </label>
                <input type="password" placeholder='Password Goes here' onChange={(e) => setPassword(e.target.value)}/>
                {username && password && <button type="submit"> Login </button>} 
            </div>
        </form>

        <NavLink to="/register">
            <button>
                Sign Up!
            </button>
        </NavLink>

        <div>
            {isLoggedin ? <h1> bruh </h1> : <h1> not bruh </h1>}
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