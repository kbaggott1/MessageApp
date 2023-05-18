import { SendMessageForm } from "./SendMessageForm";
import { RefreshMessages } from "./RefreshMessages";
import { UpdateMessageForm } from "./UpdateMessageForm";
/**
 * Component that contains controls for the user
 * @prop messages: An array of all messages.
 * @prop setMessages: Setter to set the state of messages.
 * @prop setChatBoxError: Sets the chatBoxError property
 * @prop setChatBoxErrorMessage: Sets the error messsage property
 * @returns A JSX component containing a div with user controls
 */
export function UserControls({messages, setMessages, setChatBoxError, setChatBoxErrorMessage}) {

    return <>
    <div className="userControlDiv">
        <SendMessageForm messages={messages} setMessages={setMessages} setChatBoxError={setChatBoxError} setChatBoxErrorMessage={setChatBoxErrorMessage}/>
        <div className="miscControls">
            <button className="refreshButton" onClick={() => RefreshMessages(setMessages, setChatBoxError, setChatBoxErrorMessage)}>Refresh</button>
        </div>
        
    </div>
    </>
}