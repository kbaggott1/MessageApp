import { Alert, AlertTitle } from "@mui/material";
import { useState } from "react";
import { RefreshMessages } from "./RefreshMessages";
import { ErrorBox } from "./ErrorBox";

/**
 * A component that contains a form to send a message
 * @prop messages: current list of messages
 * @prop setMessages: A setter method to change the state of the messages
 * @prop setChatBoxError: Sets the chatBoxError property
 * @prop setChatBoxErrorMessage: Sets the error messsage property
 * @returns A JSX form to send a message
 */
export function SendMessageForm({messages, setMessages, setChatBoxError, setChatBoxErrorMessage}) {
    const [messageBody, setMessageBody] = useState();
    const [username, setUserName] = useState();
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if(messages < 1) {
            messages = await RefreshMessages(setMessages, setChatBoxError, setChatBoxErrorMessage);
        }

        const requestOptions = {
            method: "POST",
            body: JSON.stringify({
                messageId: (messages.length > 0 ? messages.slice(-1)[0].messageId + 1: 0),
                message: messageBody,
                user: username,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        };

        const response = await fetch("http://localhost:1339/messages", requestOptions);
        if(response.status == 200) {
            await RefreshMessages(setMessages, setChatBoxError, setChatBoxErrorMessage);
        }
        else {
            const result = await response.json();
            setShowError(true);
            setErrorMessage(result.errorMessage);
        }


    };

    return <>
    <div className="sendMessageForm">
        <h3>Send message</h3>
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Message..." onChange={(e) => setMessageBody(e.target.value)} />
            <input type="text" placeholder="Username..." onChange={(e) => setUserName(e.target.value)} />
            <button className="sendButton" type="submit" >Send</button>
            <ErrorBox showError={showError} setShowError={setShowError} title={"Message could not be sent..."} message={errorMessage}/>
        </form>
    </div>
    </>
}