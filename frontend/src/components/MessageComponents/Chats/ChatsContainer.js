import { NewChat } from "./NewChat";
import { LoggedInUserContext } from "../../App"
import { useContext, useState, useEffect } from "react";
import { Chat } from "./Chat";

export function ChatsContainer({chats, setChats}) {
    const [ userData, setUserData ] = useContext(LoggedInUserContext);
    //const [chats, setChats] = useState();

    /*
    useEffect(() => {
        getChats(userData, setChats);
    }, [chats, getChats]); //doesnt refresh on add

    */
    //setInterval(() => {getChats(userData, setChats)}, 10000)
    //getChats(userData, setChats); //NO AWAIT??
    //let chats = getChats(userData);

    return <div>
        <h1>Chats</h1>
        <NewChat refreshChats={() => {getChats(userData, setChats)}}/>
        {chats && chats.length > 0 ? chats.map(chat => (
            <Chat key={chat.senderId} chat={chat}/>
        )) : <h2>No chats yet!</h2>}
    </div>
}

export async function getChats(user, setChats) {
    try {
        const response = await fetch("http://localhost:1337/chats/chatsBySenderId/" + user._id.toString());

        if(response.status === 400) { // not really users fault, shouldnt be a 400
            console.log("No chats found for user.");
        }
        else {
            const result = await response.json();
            //console.log(result);
            setChats(result);
            //return result;
        }
    }
    catch(err) {
        alert("Error trying to get chats: " + err.message);
    }

    
}