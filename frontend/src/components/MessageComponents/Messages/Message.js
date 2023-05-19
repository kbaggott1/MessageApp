import './Message.css';
import { useContext } from 'react';
import { LoggedInUserContext } from '../../App';

/**
 * Returns a message component. The side on which the message sits depends of if the user signed in has an ID
 * that matches the sender ID or the recipient ID. If the user is the sender the mssage appears on the right
 * but if they are the recipient it appears on the left.
 * @prop {object} Message Contains a message object. Object should have both 'sentDate' and 'messageBody' fields.
 * @returns JSX component contaning a message. Messages has a sent date and contains the body contents.
 */
export function Message({message}) {
    const [userData, setUserData] = useContext(LoggedInUserContext);

    return (
    <div className={message.authorId == userData._id ? "messageBoxSender" : "messageBoxRecipient"}>
        <div className='messageBox'>
           <p>{message.sentDate}</p> 
           <p>{message.messageBody}</p>
        </div>   
    </div>)
}