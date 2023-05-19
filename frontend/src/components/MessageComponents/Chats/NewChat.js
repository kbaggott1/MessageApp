import './Chats.css'
import { LoggedInContext, LoggedInUserContext } from "../../App";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

/**
 * A New Chat contains user controls to start a new chat using one text field and a button.
 * @prop {*} refreshChats A method that when called refreshes the chats container component.
 * @returns A JSX Component containing a form to get user input.
 */
export function NewChat({refreshChats}) {
    const [ userData, setUserData ] = useContext(LoggedInUserContext);
    const [isLoggedin, setIsLoggedIn] = useContext(LoggedInContext);
    const [ username, setUsername ] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const requestOptions = {
            method: "GET",
            credentials: "include",
            mode: 'cors', // this cannot be 'no-cors'
            };

        if(username != "") {
            try {
                const response = await fetch("http://localhost:1337/users/"+ username, requestOptions);
                const result = await response.json();

                if(response.status === 200) {
                    addChat(userData._id, result._id, navigate, setUserData, setIsLoggedIn );
                    refreshChats();
                }
                else {
                    alert("Could not find user: " + username+ "\nEnsure you typed the username correctly!");
                }
            }
            catch(err) {
                alert("Could not add new chat: " + err.message);
            }
        }
        else {
            alert("Username cannot be empty.");
        }


    }

    return (
        <>
        <form onSubmit={handleSubmit}>
            <input type='text' placeholder='New chat with user...' onChange={(e) => setUsername(e.target.value)}></input>
            <button type="submit">+</button>
        </form>
        </>
    )

}

async function addChat(userSenderId, userRecipientId, navigate, setUserData, setIsLoggedIn, flip = false) {

    const requestOptions = {
        method: "POST",
        credentials: "include",
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userSenderId: userSenderId,
            userRecipientId: userRecipientId,
        }),
    };

    try {
        const response = await fetch("http://localhost:1337/chats", requestOptions);
        if(response.status === 200) {
            if(!flip) {
                addChat(userRecipientId, userSenderId, navigate, setUserData, setIsLoggedIn, true);
            }
        }
        else if(response.status === 401) {
            alert("Your session has expired! Please Login again to continue")
            setUserData(null);
            setIsLoggedIn(false);
            navigate('/');
        }

        
    }
    catch(err) {
        alert("Could not create chat: "+err.message);
    }
}