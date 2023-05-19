import { useState, useContext } from "react";
import { LoggedInContext, LoggedInUserContext, ChatContext } from "../components/App";
import { ChatBox} from "../components/MessageComponents/Messages/ChatBox";
import { UserControls } from "../components/MessageComponents/Messages/UserControls";
import './Messages.css';
/**
 * Component of the messages page
 * @returns A JSX component containing the messages page
 */
export function Messages() {
    const [selectedChat, setSelectedChat] = useContext(ChatContext);
    const [userData, setUserData] = useContext(LoggedInUserContext);


    return <div>
        <h1>Messages</h1>
        <div>
            <ChatBox />
            <UserControls />
        </div>
    </div>
}