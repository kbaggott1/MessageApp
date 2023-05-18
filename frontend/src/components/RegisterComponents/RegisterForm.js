import { useContext, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { LoggedInContext, LoggedInUserContext } from "../App.js"


export function RegisterForm() {
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [password2, setPassword2] = useState(null);
    const [biography, setBiography] = useState(null);
    const [firstName, setFirstName] = useState(null);
    const [lastName, setLastName] = useState(null);
    const [ isLoggedin, setIsLoggedIn ] = useContext(LoggedInContext);
    const [ userData, setUserData ] = useContext(LoggedInUserContext);
    const navigate = useNavigate();

    //Handles the request to create a user
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {

            //create user

            if(validateInputs(username, password, password2, firstName, lastName, biography)) {
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
        <form onSubmit={handleSubmit}>
            <div className='LoginInputBox'>
                <label htmlFor='username'> Username </label>
                <input type="text" placeholder='Username...' onChange={(e) => setUsername(e.target.value)}/>
                <br/>
                <label htmlFor='password'> Password </label>
                <input type="password" placeholder='Password...' onChange={(e) => setPassword(e.target.value)}/>
                <br/>
                <label> Re-type Password </label>
                <input type="password" placeholder='Re-type password...' onChange={(e) => setPassword2(e.target.value)}/>
                <br/>
                <label> First Name </label>
                <input type="text" placeholder='First Name' onChange={(e) => setFirstName(e.target.value)}/>
                <br/>
                <label> Last Name </label>
                <input type="text" placeholder='Last Name' onChange={(e) => setLastName(e.target.value)}/>
                <br/>
                <label> Biography </label>
                <input type="text" placeholder='Biography' onChange={(e) => setBiography(e.target.value)}/>
                <br/>
                {username && password && password2 && firstName && lastName && biography && <button type="submit"> Login </button>} 
            </div>
        </form>

        <NavLink to="/login">
            <button>
                I already have an account.
            </button>
        </NavLink>

        <div>
            {isLoggedin ? <h1> bruh </h1> : <h1> not brtuh </h1>}
        </div>
        </>

    )


}

function validateInputs(username, password, password2, firstName, lastName, biography) {
    if(username == "") {
        alert("Username cannot be empty");
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
    /*
    const requestOptions = {
        method: "GET",
        credentials: "include",
        mode: 'cors', // this cannot be 'no-cors'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: findThisUser,
        }),
    };
    */

    const response = await fetch("http://localhost:1337/users/"+ findThisUser);
    const result = await response.json();
    return result;
}