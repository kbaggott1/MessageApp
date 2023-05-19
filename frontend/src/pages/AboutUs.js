import './AboutUs.css';

/**
 * About us text.
 * @returns About us text.
 */
export function AboutUs() {
    return (
        <>
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

        <br></br> 
        <br></br> 
        <br></br> 
        <br></br> 
        <br></br> 
        <br></br> 
        <br></br> 

        <p className="description">Our message service began as an idea in the 
        <br></br> minds of three bright computer scientists 
        <br></br> studying at John Abbott College. All three of 
        <br></br> our founders (pictures on the left) 
        <br></br> had lived their whole lives using 
        <br></br> messaging services and had almost felt like 
        <br></br>  the many flaws of these platforms were 
        <br></br> simply fact. That was until they decided to fix 
        <br></br>  the problems they saw with the instant 
        <br></br> messaging apps they used themselves. They 
        <br></br> got together and worked tirelessly to create 
        <br></br> something better and solve the issues so 
        <br></br> prevalent in the instant messaging domain.  
        <br></br> As computer scientists, we have have the right
        <br></br> knowledge to provide solutions to these issues.
        <br></br> 
        <br></br> Our app is different in the sense 
        <br></br> that it provides an interface
        <br></br> that is easy to understand for the average user.
        <br></br> We decided to make our app very visual, with buttons
        <br></br> that are pretty self explanatory about what they do 
        <br></br> once the user presses on them just by looking at them.
        <br></br> Therefore, it is great for people of any age due to its ease of use, 
        <br></br> especially the elderly, who often have difficulty with technology.  
        <br></br> 
        <br></br> So, if you want an application that is easy to use for everyone 
        <br></br>and has a great looking user interface...
        <br></br> What are you waiting for to join?
        </p>
        </>
    );
}