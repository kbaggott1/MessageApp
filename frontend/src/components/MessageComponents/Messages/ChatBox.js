import { ChatContext } from '../../App';
import { Message } from './Message';
import './ChatBox.css';
import { useContext, useState, useEffect } from 'react';
import { LoggedInUserContext } from '../../App';

/**
 * The chat box component contains all the messages for the selected chat if a chat is selected.
 * @returns A JSX Component containing a chat box div that either has a header or messages in it.
 */
export function ChatBox() {
    const [selectedChat, setSelectedChat] = useContext(ChatContext);
    const [ userData, setUserData ] = useContext(LoggedInUserContext);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        getMessages(selectedChat, setMessages);
        const interval = setInterval(() => {
            getMessages(selectedChat, setMessages);
            
        }, 1000)

        return ()=> clearInterval(interval);
    }, [selectedChat]);

    return (
        
        <div className='chatBox'>
            {
                selectedChat._id ? 
                messages.length == 0 ? <h2>No messages yet</h2> :
                messages.map(message => (
                    <Message key={message._id} message={message} />
                )) : <h2>No chat selected</h2>
            }
        </div>
    )
}

async function getMessages(selectedChat, setMessages) {
    try {
        const requestOptions = {
            method: "GET",
            credentials: "include",
            mode: 'cors', 
        };


        if(selectedChat._id) {
            const response = await fetch("http://localhost:1337/messages/chatid/" + selectedChat._id, requestOptions);
            if(response.status === 400) { // not really users fault, shouldnt be a 400
                setMessages([]);
            }
            else {
                if(response.status === 200) {
                    const result = await response.json();
                    setMessages(result.length == 0 ? [] : result);
                }
            }
        }
    }
    catch(err) {
        alert("Error trying to get chats: " + err.message);
    }
}