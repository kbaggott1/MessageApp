import { useState } from 'react';


/**
 * A component for the home page
 * @returns A JSX component containing the home page
 */
export function Home() {
    return (
        <>
            {userData && userData.firstName ? <h1> {userData.firstName} </h1> : <h1> bruh </h1>}
        </>
    )
}