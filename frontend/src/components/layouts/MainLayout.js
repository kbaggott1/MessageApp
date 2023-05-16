import React from "react";
import './MainLayout.css'
import { Outlet } from 'react-router-dom'
//import { NavBar } from '../navigationbar/NavBar';
import {NavBar } from '../navigationBar/NavBar';


/**
 * A component that contains the layout for the react app.
 * @returns JSX layout of the react app.
 */
export function MainLayout() {
    return (
        <>
        <div className="navigationBar">
            <NavBar/>
        </div>
        <div className="mainContent">
            <Outlet/>
        </div>
        </>

    )
}