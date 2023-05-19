import './AboutImages.css'

/**
 * 
 * @returns 
 */
export function AboutImages() {
    return (
        <>
        <div className='images'>
        <img className="Kevin" src={process.env.PUBLIC_URL + '/Kevin.jpg'} alt="Kevin" />
        <img className="Cristiano"src={process.env.PUBLIC_URL + '/Cristiano.jpg'} alt="Cristiano" />
        <img className="Sebastian"src={process.env.PUBLIC_URL + '/Sebastian.png'} alt="Sebastian" />
        </div>
        </>
    )
}