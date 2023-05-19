import { AboutUs } from './AboutUs';
import { AboutImages } from './AboutImages';
import './AboutUs.css';



/**
 * A component for the home page
 * @returns A JSX component containing the home page
 */
export function Home() {
    return (
        <>
        <div>
            <h1>Welcome to our Messaging Service!</h1>

            <hr style={{
                color: "#2E4F4F", 
                backgroundColor: "#00BFFF", 
                height: 1, 
                borderColor: "#2C3333",
                width: "95%",
                marginLeft: "auto",
                marginRight: "auto"
            }}/>

            <h1>Let us tell you a bit about ourselves!</h1>
            <div className='homeContainer'>
                <AboutUs/>
                <h1>Our founders:</h1>
                <AboutImages />
            </div>
        </div>


        </>
    )
}