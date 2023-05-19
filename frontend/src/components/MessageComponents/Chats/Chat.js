import { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { ChatContext } from "../../App";
import { LoggedInContext, LoggedInUserContext } from "../../App";

/**
 * The component displays the name of the recipiant of the chat. It contains a clickable div to select the chat and a 
 * button that appears on hover to delete the chat and all it's messages associated with it.
 * @prop {*} chat The chat object from the database.
 * @prop {*} refreshChats A method to be called that refreshes the chats container.
 * @returns A JSX Component which has the chat.
 */
export function Chat({chat, refreshChats}) {
    const [visibility, setVisibility] = useState("hidden");
    const [user, setUser] = useState([]);
    const [ userData, setUserData ] = useContext(LoggedInUserContext);
    const [isLoggedin, setIsLoggedIn] = useContext(LoggedInContext);
    const [selectedChat, setSelectedChat] = useContext(ChatContext);
    const navigate = useNavigate();
    
    useEffect(() => {
        getUsername(chat, setUser);
    }, [getUsername])

    
    return(
        
            <div className={chat._id == selectedChat._id ? "selectedChat" : "chat"} onMouseLeave={() => setVisibility("hidden")} onMouseEnter={() => setVisibility("visible")}>
                <div className="chatButton" onClick={() => {setSelectedChat(chat)}}>
                    <h3>{user.firstName + " " + user.lastName}</h3>
                </div>
                
                <button style={{visibility: visibility}} className="deleteButton" onClick={() => {deleteChat(chat, refreshChats, navigate, setUserData, setIsLoggedIn ); setSelectedChat({})}}>Delete</button>
            </div>
        

    )
    
}

/**
 * Deletes a chat along with all the associated messages. 
 * @param {*} chat Chat object of the chat that will be deleted. Must contain '_id', 'userRecipientId'
 *                 'userSenderId' fields.
 * @param {*} refreshChats 
 * @param {*} navigate 
 * @param {*} setUserData 
 * @param {*} setIsLoggedIn 
 * @param {*} isLinkedChat 
 */
async function deleteChat(chat, refreshChats, navigate, setUserData, setIsLoggedIn, isLinkedChat = false) {
    try {
        if(!isLinkedChat) {
            const linkedChat = await getLinkedChat(chat.userRecipientId, chat.userSenderId);
            await deleteChat(linkedChat, refreshChats, navigate, setUserData, setIsLoggedIn, true);
        }

        const requestOptions = {
            method: "DELETE",
            credentials: "include",
            mode: 'cors', 
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                _id: chat._id,
            }),
        };

        await deleteMessages(chat);
        const response = await fetch("http://localhost:1337/chats", requestOptions);
        
        if(!isLinkedChat) {
            if(response.status === 401) {
                alert("Your session has expired! Please Login again to continue")
                setUserData(null);
                setIsLoggedIn(false);
                navigate('/');
            }
            refreshChats();
        }

    }
    catch(err) {
        isLinkedChat ? alert("Could not delete linked chat: " + err.message) : alert("Could not delete chat: " + err.message);
    }
}

/**
 * Deletes all messages that were sent in a specific chat. Makes a GET request to the server to verify
 * that the chat exists, if it does, a all of the messages are iterated over and each of them is deleted.
 * @param {*} chat Chat object representing that chat that will be deleted. Must contain an '_id' field.
 */
async function deleteMessages(chat) {
    try {
        let requestOptions = {
            method: "GET",
            credentials: "include",
            mode: 'cors', 
        };

        let response = await fetch("http://localhost:1337/messages/chatid/" + chat._id, requestOptions);
        if(response.status === 200) {
            let result = await response.json();
            
            for(let i = 0; i < result.length; i++) {
                requestOptions = {
                    method: "DELETE",
                    credentials: "include",

                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messageId: result[i]._id,
                    }),
                };

                response = await fetch("http://localhost:1337/messages", requestOptions);
            }
        }
    }
    catch(err) {
        alert("Could not delete chat: " + err.message);
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

/**
 * Gets a user based on the recipentId present in the chat. A GET request is made to ther server
 * requesting a user based on the userRecipientId field inside of the chat object.
 * @param {*} chat A Chat object, must contain a 'userRecipientId' field
 * @param {*} setUser React hook that is set the user with an ID matching the 'userRecipientId'
 *                    field of the chat object provided the to the method.
 */
async function getUsername(chat, setUser) {
    try {
        const requestOptions = {
            method: "GET",
            credentials: "include",
            mode: 'cors', 
        };

        const response = await fetch("http://localhost:1337/users/user/" + chat.userRecipientId, requestOptions);
        if(response.status === 200) {
            const result = await response.json();
            setUser(result);
        }
    }
    catch(err) {
        alert("Could not get username for chat: " + err.message);
    }
}