import { useState } from "react";
import { RefreshMessages } from "./RefreshMessages";
import { ErrorBox } from "./ErrorBox";
/**
 * A component that allows the user to edit a message.
 * @prop setMessages: Method to update the messages
 * @prop setRenderUpdateForm: Method to change whether or not the UpdateMessageForm Component should be rendered
 * @prop messageId: The messageId of the message to be updated
 * @prop oldMessage: The oldMessage of the message being edited
 * @prop username: The username of the user who posted the original message
 * @returns a JSX form to update a message
 */
export function UpdateMessageForm({setMessages, setRenderUpdateForm, messageId, oldMessage, username}) {

    const [messageBody, setMessageBody] = useState();
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const requestOptions = {
            method: "PUT",
            body: JSON.stringify({
                messageId: messageId,
                message: messageBody,
                user: username,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        };

        const response = await fetch("http://localhost:1339/messages", requestOptions);       

        if(response.status == 200) {
            await RefreshMessages(setMessages);
            setRenderUpdateForm(false);
        }
        else {
            const result = await response.json();
            setShowError(true);
            setErrorMessage(result.errorMessage);
        }
    }

    return (
    <div className="sendMessageForm">
        <h3>Edit message</h3>
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder={oldMessage+"..."} onChange={(e) => setMessageBody(e.target.value)} />
            <button className="sendButton" type="submit" disabled={messageBody ? false : true}>Update</button>
            <button className="sendButton" onClick={() => setRenderUpdateForm(false)}>Cancel</button>
            <ErrorBox showError={showError} setShowError={setShowError} title={"Message could not be editted..."} message={errorMessage}/>
        </form>
    </div>
    )
}