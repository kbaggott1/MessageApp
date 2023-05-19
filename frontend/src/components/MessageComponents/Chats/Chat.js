import { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { ChatContext } from "../../App";
import { LoggedInContext, LoggedInUserContext } from "../../App";

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
                
                <button style={{visibility: visibility}} className="deleteButton" onClick={() => {deleteChat(chat, refreshChats, navigate, setUserData, setIsLoggedIn )}}>Delete</button>
            </div>
        

    )
    
}

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