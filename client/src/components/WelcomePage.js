const delay = time => (new Promise(res => setTimeout(res, time)));
const timeout = async() => {
    await delay(3000);
}

export default function WelcomePage( {model, logoutClicked, setClicked, nextState, setUserState, userState, dbFailure, setDbFailure} ) {
    console.log("UserState: " + userState);
    model.get("http://localhost:8000/homepage", {withCredentials: true}).then(async (res) => { // db error => sign out user
        console.log("Response from Server: " + res.data);
        console.log(dbFailure);
        if (dbFailure.type !== "") {
            document.getElementById("defaultMessage").hidden=true;
            document.getElementById("logoutMessage").hidden=true;
            if (dbFailure === "question") {
                document.getElementById("dbErrorQuestion").hidden=false;
                document.getElementById("dbErrorAnswer").hidden=true;
                document.getElementById("dbErrorComment").hidden=true;
            }
            else if (dbFailure === "answer") {
                document.getElementById("dbErrorQuestion").hidden=true;
                document.getElementById("dbErrorAnswer").hidden=false;
                document.getElementById("dbErrorComment").hidden=true;
            }
            else {
                document.getElementById("dbErrorQuestion").hidden=true;
                document.getElementById("dbErrorAnswer").hidden=true;
                document.getElementById("dbErrorComment").hidden=false;
            }
            await timeout();
            setDbFailure("");
            setClicked(0);
            setUserState(1);
            nextState(5);
        }
        else if (res.data === "sessionFound") { // session is stored => redirect user to homepage
            console.log("sessionFound");
            console.log("userState: " + userState);
            console.log("logoutClicked: " + logoutClicked);
            setUserState(0);
            nextState(0);
        }
        else if (logoutClicked && userState) { // Logout successful => redirect user to welcome page
            console.log("logged out");
            console.log("userState: " + userState);
            console.log("logoutClicked: " + logoutClicked);
            document.getElementById("dbErrorQuestion").hidden=true;
            document.getElementById("dbErrorAnswer").hidden=true;
            document.getElementById("defaultMessage").hidden=true;
            document.getElementById("logoutMessage").hidden=false;
            await timeout();
            setClicked(0);
            setUserState(1);
            nextState(5);
        }
        else if (!logoutClicked) { // initial welcome page message
            console.log("initialHomepage");
            console.log("userState: " + userState);
            console.log("logoutClicked: " + logoutClicked);
            document.getElementById("dbErrorQuestion").hidden=true;
            document.getElementById("dbErrorAnswer").hidden=true;
            document.getElementById("defaultMessage").hidden=false;
            document.getElementById("logoutMessage").hidden=true;
            setUserState(1);
            nextState(5);
        }
        else {
            console.log("UnexpectedError");
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
                <p id="defaultMessage" hidden={true}>
                    Please select one of the three options above.

                    [No open sessions detected]
                </p>
                <p id="logoutMessage" hidden={true}>
                    Successfully logged out. Thanks for visiting our site!
                </p>
                <p id="dbErrorQuestion" hidden={true}>
                    Session removed from database before attempt was made to post a question. You have been signed out.
                    Please click on "Returning User" and login to your account.
                </p>
                <p id="dbErrorAnswer" hidden={true}>
                    Session removed from database before attempt was made to post an answer. You have been signed out.
                    Please click on "Returning User" and login to your account.
                </p>
                <p id="dbErrorComment" hidden={true}>
                    Session removed from database before attempt was made to post a comment. You have been signed out.
                    Please click on "Returning User" and login to your account.
                </p>
                <p id="unexpectedError" hidden={true}>
                    An unexpected error occurred during your previous session. Please click on "Returning User" and login to your account.
                </p>
            </div>
        </div>
    )
}