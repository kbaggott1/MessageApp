import './MessagesLayout.css'
import { ChatsContainer , getChats} from '../MessageComponents/Chats/ChatsContainer';
import { Messages } from "../../pages/Messages";
import { LoggedInUserContext } from "../App"
import { useContext, useState, useEffect, createContext } from "react";

const ChatContext = createContext({
    selectedChat: false,
    setSelectedChat: () => {},
  })

/**
 * A component that contains the layout for the react app.
 * @returns JSX layout of the react app.
 */
export function MessagesLayout() {
    const [ userData, setUserData ] = useContext(LoggedInUserContext);
    const [selectedChat, setSelectedChat] = useState();



    return (
        <>
        <ChatContext.Provider>
            <div className="container">
                <div className="chats">
                    <ChatsContainer />
                </div>
                <div className="messagesContent">
                    <Messages />
                </div>
            </div>
        </ChatContext.Provider>

        </>

    )
}

export {ChatContext}