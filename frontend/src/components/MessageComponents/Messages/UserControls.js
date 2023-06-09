import { useContext, useState } from 'react';
import { LoggedInUserContext, LoggedInContext, ChatContext } from '../../App';
import { useNavigate } from 'react-router-dom';

import './UserControls.css';
/**
 * Component that contains controls for the user
 * @prop messages: An array of all messages.
 * @prop setMessages: Setter to set the state of messages.
 * @prop setChatBoxError: Sets the chatBoxError property
 * @prop setChatBoxErrorMessage: Sets the error messsage property
 * @returns A JSX component containing a div with user controls
 */
export function UserControls() {
    const [selectedChat, setSelectedChat] = useContext(ChatContext);
    const [userData, setUserData] = useContext(LoggedInUserContext);
    const [isLoggedin, setIsLoggedIn] = useContext(LoggedInContext);
    const [messageBody, setMessageBody] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if(!selectedChat._id) {
            alert("You must select a chat before sending a message.");
        }
        else {
            if(messageBody == "") {
                alert("You cannot send an empty message.");
            }
            else {
                if(messageBody.length > 250) {
                    alert("Message cannot be more than 250 characters long.");
                }
                else {
                    await addMessage(userData, messageBody, navigate, selectedChat, setUserData, setIsLoggedIn);
                }
                
            }  
        }
    }

    return (
    <div>
        <form onSubmit={handleSubmit}>
            <div className='userControlsSend'>
                <input type="text" className='sendMessageTextBox' placeholder="message..." onChange={(e) => {setMessageBody(e.target.value)}}></input>
                <button type="submit" className='sendMessageButton'>Send</button>
            </div>

        </form>
    </div>
    )
}

async function addMessage(userData, messageBody, navigate, selectedChat, setUserData, setIsLoggedIn, flip = false) {
    const requestOptions = {
        method: "POST",
        credentials: "include",
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messageBody: messageBody,
            authorId: userData._id,
            chatId: selectedChat._id,
        }),
    };

    try {
        const response = await fetch("http://localhost:1337/messages", requestOptions);
        if(response.status === 200) {
            if(!flip) {
                await addMessage(userData, messageBody, navigate, await getLinkedChat(selectedChat.userRecipientId, selectedChat.userSenderId), setUserData, setIsLoggedIn, true)
            }
        }
        else if(response.status === 401) {
            alert("Your session has expired! Please Login again to continue");
            setUserData(null);
            setIsLoggedIn(false);
            navigate('/');
        }
        else if (response.status === 400){
            alert("Invalid input.");
        }

        
    }
    catch(err) {
        alert("Could not create chat: "+err.message);
    }
}

async function getLinkedChat(userRecipientId, userSenderId) {
    try {
        const requestOptions = {
            method: "GET",
            credentials: "include",
            mode: 'cors', 
        };
        const response = await fetch("http://localhost:1337/chats/chatsBySenderId/" + userRecipientId, requestOptions);

        if(response.status === 400) { // not really users fault, shouldnt be a 400
            console.log("No chats found for user.");
        }
        else {
            const result = await response.json();

            for(let i = 0; i < result.length; i++) {
                if(result[i].userRecipientId.toString() == userSenderId.toString()) {
                    return result[i];
                }
            }

        }
    }
    catch(err) {
        alert("Error trying to get chats in delete: " + err.message);
    }
}