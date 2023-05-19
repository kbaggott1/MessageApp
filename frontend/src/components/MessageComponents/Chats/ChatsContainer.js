import { NewChat } from "./NewChat";
import { LoggedInUserContext } from "../../App"
import { useContext, useState, useEffect } from "react";
import { Chat } from "./Chat";

/**
 * The chats container holds user controls related to chats and the individual chats
 * which are retrieved from the database every second.
 * @returns A JSX Object contains a div with user controls for adding new chats
 *          and a list of chat components.
 */

export function ChatsContainer() {
    const [ userData, setUserData ] = useContext(LoggedInUserContext);
    const [chats, setChats] = useState([]);

    
    useEffect(() => {
        getChats(userData, setChats);
        const interval = setInterval(() => {
            getChats(userData, setChats);
            
        }, 1000)

        return ()=> clearInterval(interval);
    }, [userData]);



    return <div>
        <h1>Chats</h1>
        <NewChat refreshChats={() => {getChats(userData, setChats)}}/>
        {chats && chats.length > 0 ? chats.map(chat => (
            <Chat key={chat._id} chat={chat} refreshChats={() => {getChats(userData, setChats)}}/>
        )) : <h2>No chats yet!</h2>}
    </div>
}

export async function getChats(user, setChats) {
    try {
        const requestOptions = {
            method: "GET",
            credentials: "include",
            mode: 'cors', 
        };

        const response = await fetch("http://localhost:1337/chats/chatsBySenderId/" + user._id, requestOptions);

        if(response.status === 400) { // not really users fault, shouldnt be a 400
            //console.log("No chats found for user.");
            setChats([]);
        }
        else {
            if(response.status === 200) {
                const result = await response.json();
                setChats(result.length == 0 ? [] : result);
            }

            
        }
    }
    catch(err) {
        alert("Error trying to get chats: " + err.message);
    }

    
}