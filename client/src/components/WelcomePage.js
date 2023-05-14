export default function WelcomePage( {model, cookie, nextState} ) {
    console.log("Cookie: " + cookie["val"]);
    if (cookie.val !== "") {
        let reqSession = model.get("http://localhost:8000/homepage", {cookie});
        console.log(reqSession);
        if (reqSession === "sessionFound") {
            nextState(7);
        }
    }
    return (
        <div className="menu main">
            <h2>Welcome to the greatest webthingy of all time.</h2>
            <button id="register" onClick={() => {
                nextState(6);
            }}>
                Register
            </button>
            <button id="login" onClick={async () => {
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