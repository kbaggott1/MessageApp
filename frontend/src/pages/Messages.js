import { ChatBox} from "../components/MessageComponents/Messages/ChatBox";
import { UserControls } from "../components/MessageComponents/Messages/UserControls";
import './Messages.css';

/**
 * Component of the messages page
 * @returns A JSX component containing the messages page
 */
export function Messages() {
    return (
        <div>
            <h1>Messages</h1>
            <div>
                <ChatBox />
                <UserControls />
            </div>
        </div>
    )
}