export default function WelcomePage( {nextState} ) {
    
    return (
        <div className="menu main">
            <h2>Welcome to the greatest webthingy of all time.</h2>
            <button id="register" onClick={() => {
                nextState(6);
            }}>
                Register
            </button>
            <button id="login" onClick={() => {
                nextState(7);
            }}>
                Returning User
            </button>
            <button id="guest" onClick={() => {
                nextState(0);
            }}>
                Continue as Guest
            </button>
        </div>
    )
}