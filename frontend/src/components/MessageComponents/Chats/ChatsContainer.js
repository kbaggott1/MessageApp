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
    
}