import { AboutUs } from './AboutUs';
import { AboutImages } from './AboutImages';

import { useState } from 'react';


/**
 * A component for the home page
 * @returns A JSX component containing the home page
 */
export function Home() {
    return (
        <>
        <AboutUs/>
        <AboutImages/>
        </>
    )
}