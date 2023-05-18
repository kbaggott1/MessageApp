import { NewChat } from "./NewChat";
import { LoggedInUserContext } from "../../App"
import { useContext } from "react";

export function ChatsContainer() {
    const [ userData, setUserData ] = useContext(LoggedInUserContext);

    const chats = getChats(userData); //NO AWAIT??
    
    return <div>
        <h1>Chats</h1>
        {}
        <NewChat />
    </div>
}

async function getChats(user) {
    const response = await fetch("http://localhost:1337/chatsBySenderId/" + user._id.toString());
    const result = await response.json();
    console.log(result);
    return result;
}