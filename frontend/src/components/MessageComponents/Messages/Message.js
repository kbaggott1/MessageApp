import './Message.css';
import { useContext } from 'react';
import { LoggedInUserContext } from '../../App';


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