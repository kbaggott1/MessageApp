import React from "react";
import "./NavBar.css";
import { useState, useContext } from 'react';
import * as FaIcons from "react-icons/fa"
import { Link, useResolvedPath, NavLink, useMatch } from "react-router-dom";
import { IconContext } from "react-icons";
import { IoSendSharp, IoSettings } from "react-icons/io5";
import { CgLogIn } from "react-icons/cg";
import { MdOutlineLogout } from 'react-icons/md'
import { LoggedInContext, LoggedInUserContext } from "../App.js"

/**
 * A component for the navigation bar.
 * @returns JSX component containing the navigation bar
 */
export function NavBar(){

    const [ userData, setUserData ] = useContext(LoggedInUserContext);
    const [ isLoggedin, setIsLoggedIn ] = useContext(LoggedInContext);
    return (
        <>
            <nav className="navbar">
                <ul className="nav-menu-items">
                    <li>
                        {
                        isLoggedin ? 
                        <NavLink to="/">
                            <button className="navButton" onClick={() => {logout(setIsLoggedIn, setUserData)}}>
                                <MdOutlineLogout size={70}/>
                            </button>
                        </NavLink>
                         :    

                        <NavLink to="/login">
                            <button className="navButton">
                                <CgLogIn size={70}/>
                            </button>
                        </NavLink>
                        }
                    </li>
                    <li>
                        <NavLink to="/">
                            <button className="navButton">
                                    <FaIcons.FaHome size={70}/>
                            </button>
                        </NavLink>
                    </li>
                    {isLoggedin && <>
                    <li>
                        <NavLink to="/messages">
                            <button className="navButton">
                                
                                <IoSendSharp size={70}/>
                            </button>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/settings">
                            <button className="navButton">
                                <IoSettings size={70}/>
                            </button>
                        </NavLink>
                    </li>
                    </>
                    }

                </ul>
            </nav>
        </>
    );
}

async function logout(setIsLoggedIn, setUserData) {
    
    const response = await fetch("http://localhost:1337/session/logout/");
    setIsLoggedIn(false);
    setUserData(null);
    
}