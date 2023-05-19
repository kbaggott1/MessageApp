import './Chats.css'
import { LoggedInUserContext } from "../../App";
import { useContext, useState, useEffect } from "react";

export function NewChat({refreshChats}) {
    const [ userData, setUserData ] = useContext(LoggedInUserContext);
    const [ username, setUsername ] = useState("");

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
                    addChat(userData._id, result._id);
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

async function addChat(userSenderId, userRecipientId, flip = false) {

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
                addChat(userRecipientId, userSenderId, true);
            }
        }

        
    }
    catch(err) {
        alert("Could not create chat: "+err.message);
    }
}