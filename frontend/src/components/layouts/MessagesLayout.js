import React from "react";
import './MessagesLayout.css'
import { Outlet } from 'react-router-dom'
import { NavBar } from '../navigationBar/NavBar';
import { Chats } from '../MessageComponents/Chats/Chats';
import { Message } from "../MessageComponents/Message";
import { Messages } from "../../pages/Messages";


/**
 * A component that contains the layout for the react app.
 * @returns JSX layout of the react app.
 */
export function MessagesLayout() {
    return (
        <>
        <div className="container">
            <div className="chats">
                <Chats/>
            </div>
            <div className="messagesContent">
                <Messages/>
            </div>
        </div>

        </>

    )
}