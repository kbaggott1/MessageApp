import { useState, useEffect } from "react";

export function Chat({chat, refreshChats}) {
    const [visibility, setVisibility] = useState("hidden");
    
    const [user, setUser] = useState([]);
    
    useEffect(() => {
        getUsername(chat, setUser);
    }, [getUsername])

    
    return(
        
            <div className="chat" onMouseLeave={() => setVisibility("hidden")} onMouseEnter={() => setVisibility("visible")}>
                <div className="chatButton">
                    <h3>{user.firstName + " " + user.lastName}</h3>
                </div>
                
                <button style={{visibility: visibility}} className="deleteButton" onClick={() => {deleteChat(chat, refreshChats)}}>Delete</button>
            </div>
        

    )
    
}

async function deleteChat(chat, refreshChats, isLinkedChat = false) {
    try {
        if(!isLinkedChat) {
            const linkedChat = await getLinkedChat(chat.userRecipientId, chat.userSenderId);
            await deleteChat(linkedChat, refreshChats, true);
        }

        const requestOptions = {
            method: "DELETE",
            credentials: "include",
            mode: 'cors', // this cannot be 'no-cors'
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                _id: chat._id,
            }),
        };

        await fetch("http://localhost:1337/chats", requestOptions);
        if(!isLinkedChat) {
            refreshChats();
        }

    }
    catch(err) {
        isLinkedChat ? alert("Could not delete linked chat: " + err.message) : alert("Could not delete chat: " + err.message);
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

            //console.log(result);
            //return result;
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