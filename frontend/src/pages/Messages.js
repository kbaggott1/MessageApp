import { ChatBox } from "../components/MessageComponents/ChatBox"
import { useState } from "react";
import './Messages.css';
import { UserControls } from "../components/MessageComponents/UserControls";
/**
 * Component of the messages page
 * @returns A JSX component containing the messages page
 */
export function Messages() {
    const [messages, setMessages] = useState([]);
    const [chatBoxError, setChatBoxError] = useState(false);
    const [chatBoxErrorMessage, setChatBoxErrorMessage] = useState();
    return <div>
        <h1>Messages</h1>
        <ChatBox messages={messages} setMessages={setMessages} chatBoxError={chatBoxError} setChatBoxError={setChatBoxError} chatBoxErrorMessage={chatBoxErrorMessage} setChatBoxErrorMessage={setChatBoxErrorMessage}/>
        <UserControls messages={messages} setMessages={setMessages} setChatBoxError={setChatBoxError} setChatBoxErrorMessage={setChatBoxErrorMessage}/>
    </div>
}