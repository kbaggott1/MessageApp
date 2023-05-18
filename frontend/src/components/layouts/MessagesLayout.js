import './MessagesLayout.css'
import { ChatsContainer , getChats} from '../MessageComponents/Chats/ChatsContainer';
import { Messages } from "../../pages/Messages";
import { LoggedInUserContext } from "../App"
import { useContext, useState, useEffect } from "react";

/**
 * A component that contains the layout for the react app.
 * @returns JSX layout of the react app.
 */
export function MessagesLayout() {
    const [ userData, setUserData ] = useContext(LoggedInUserContext);
    const [chats, setChats] = useState();

    /*
    useEffect(() => {
        getChats(userData, setChats);
    }, [chats]); //doesnt refresh on add

    */

    return (
        <>
        <div className="container">
            <div className="chats">
                <ChatsContainer />
            </div>
            <div className="messagesContent">
                <Messages />
            </div>
        </div>

        </>

    )
}