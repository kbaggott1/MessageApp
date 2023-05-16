import React from "react";
import "./NavBar.css";
import { useState } from 'react';
import * as FaIcons from "react-icons/fa"
import { Link, useResolvedPath, NavLink, useMatch } from "react-router-dom";
import { IconContext } from "react-icons";
import { IoSendSharp, IoSettings } from "react-icons/io5";

/**
 * A component for the navigation bar.
 * @returns JSX component containing the navigation bar
 */
export function NavBar(){
    return (
        <>
            <nav className="navbar">
                <ul className="nav-menu-items">
                    <li>
                        <NavLink to="/">
                            <button className="navButton">
                                    <FaIcons.FaHome size={70}/>
                            </button>
                        </NavLink>
                    </li>
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
                </ul>
            </nav>
        </>
    );
}