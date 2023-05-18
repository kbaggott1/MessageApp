import React from "react";
import './MessagesLayout.css'
import { Outlet } from 'react-router-dom'
import { NavBar } from '../navigationBar/NavBar';
import { ChatsContainer } from '../MessageComponents/Chats/ChatsContainer';
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
                <ChatsContainer/>
            </div>
            <div className="messagesContent">
                <Messages/>
            </div>
        </div>

        </>

    )
}