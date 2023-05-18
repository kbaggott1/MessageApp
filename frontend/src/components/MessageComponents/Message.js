import './Message.css';
import { useState } from 'react';
import { RefreshMessages } from './RefreshMessages';
import { UpdateMessageForm } from './UpdateMessageForm';
import { ErrorBox } from './ErrorBox';
/**
 * Component that displays the message body and author
 * @prop messageId: The unique id of the message
 * @prop messageBody: The message body
 * @prop username: user who sent the message
 * @prop setMessages: Method to set the state of messages
 * @prop setChatBoxError: Sets the chatBoxError property
 * @prop setChatBoxErrorMessage: Sets the error messsage property
 * @returns A JSX div that contains message body, user, and buttons to edit and delete the message
 */
export function Message({messageId, messageBody, username, setMessages, setChatBoxError, setChatBoxErrorMessage}) {
    const [visibility, setVisibility] = useState("hidden");
    const [renderUpdateForm, setRenderUpdateForm] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState();

    const deleteMessage = async () => {

        const requestOptions = {
            method: "DELETE",
            body: JSON.stringify({
                messageId: messageId,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        };

        const response = await fetch("http://localhost:1339/messages/", requestOptions);

        if(response.status == 200) {
            RefreshMessages(setMessages, setChatBoxError, setChatBoxErrorMessage);
        }
        else {
            const result = await response.json();
            setShowError(true);
            setErrorMessage(result.errorMessage);
        }
    }

    const editMessage = async () => {
        setRenderUpdateForm(true);
    }

    return <>
    <div className="messageBox" >
        <div className='messageBody' onMouseLeave={() => setVisibility("hidden")} onMouseEnter={() => setVisibility("visible")}>
            <p>{messageBody}</p>
            {renderUpdateForm && <UpdateMessageForm setRenderUpdateForm={setRenderUpdateForm} setMessages={setMessages} messageId={messageId} oldMessage={messageBody} username={username}/>}
            <button style={{visibility: visibility}} className="messageButton" onClick={editMessage}>Edit message</button>
            <button style={{visibility: visibility}} className="messageButton" onClick={deleteMessage}>Delete message</button>
            <ErrorBox showError={showError} setShowError={setShowError} title={"Message could not be deleted..."} message={errorMessage}/>
        </div>
        <div className='username'>
            <p>sent by: <b>{username}</b></p>
        </div>
    </div>
    </>
}