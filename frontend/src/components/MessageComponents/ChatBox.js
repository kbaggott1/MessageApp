import './ChatBox.css';
import { ErrorBox } from './ErrorBox';
import { Message } from './Message';

/**
 * Component that displays messages
 * @prop messages: Array of messages each containing messageId, message, and user
 * @prop setMessages: Method to update the state of messages.
 * @prop chatBoxError: a boolean determining whether or not an error is present and to be shown
 * @prop setChatBoxError: Sets the chatBoxError value
 * @prop chatBoxErrorMessage: The error message of the error
 * @prop setChatBoxErrorMessage: Sets the error messsage property
 * @returns JSX Message components contained in a div
 */
export function ChatBox({messages, setMessages, chatBoxError, setChatBoxError, chatBoxErrorMessage, setChatBoxErrorMessage}) {


    return <div className="chatBox">
        {messages.length > 0 ? messages.map(message => (
            <Message key={message.messageId} messageId={message.messageId} messageBody={message.message} username={message.user} setMessages={setMessages} chatBoxErrorMessage={chatBoxErrorMessage} setChatBoxErrorMessage={setChatBoxErrorMessage}/>
        )) : <h2>No messages. Try refreshing.</h2>}
        <ErrorBox showError={chatBoxError} setShowError={setChatBoxError} title={"Could not refresh messages..."} message={chatBoxErrorMessage} />
    </div>
}