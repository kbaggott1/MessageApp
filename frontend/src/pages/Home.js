import { useContext, useState } from 'react';
import { LoggedInUserContext } from "../components/App.js"

/**
 * A component for the home page
 * @returns A JSX component containing the home page
 */
export function Home() {
    const [ userData, setUserData ] = useContext(LoggedInUserContext);
    return (
        <>
            {userData.firstName ? <h1> {userData.firstName} </h1> : <h1> bruh </h1>}
        </>
    )
}