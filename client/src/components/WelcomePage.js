export default function WelcomePage( {model, cookie, setUserState, nextState, userState} ) {
    console.log("Cookie: " + cookie["val"]);
    model.get("http://localhost:8000/homepage", {withCredentials: true}).then((res) => {
        //console.log("\n\n\nres.data: " + res.data + "\n\n\n");
        if (res.data === "sessionFound") { // session is stored, brings user straight to homepage
            setUserState(0);
            nextState(0);
        }
        else if (res.data === "sessionNotFound") { // session was deleted from database after logout
            nextState(5);
        }
        else { // all other cases will logout user
            setUserState(1);
            nextState(5);
        }
    });
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

            <div>
                <p id="logoutSuccessful" hidden={true}>
                    Successfully logged out. Thanks for visiting our site!
                </p>
                <p id="sessionNotFound" hidden={true}>
                    Session removed from database while retrieving homepage. Please click on "Returning User" and login to your account.
                </p>
                <p id="unknownErrorOccurred" hidden={true}>
                    An unexpected error occurred during your previous session. Please click on "Returning User" and login to your account.
                </p>
            </div>
        </div>
    )
}