import { useState } from "react";

export default function LoginPage( {model, userState, nextState, setCookie} ) {
    const [update, setUpdate] = useState({val: 0, accounts: []});
    if (update["val"] === 0) {
        model.get("http://localhost:8000/")
        .then((res) => {
            setUpdate({val:1, accounts: res.data["accounts"]})
        })
    }
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    return (
        <div className="menu main">
            <h2 id="createAccountPrompt">Please fill out the fields below:</h2>
            <div className="menu main bottom">
                <h3>Username:</h3>
                <input className="usrTxt"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                    }}>
                </input>
                <div id="usrW0" hidden={true}>
                    Please enter a valid username -- username should contain at least one character.
                </div>
                <div id="usrW1" hidden={true}>
                    No account is registered under this username. Please register account and try again.
                </div>
                <h3>Password:</h3>
                <input className="pwdTxt"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                    }}>
                </input>
                <div id="pwdW0" hidden={true}>
                    Please enter a valid password -- password should contain at least one character.
                </div>
                <div id="pwdW1" hidden={true}>
                    Password is incorrect, please try again.
                </div>
            </div>
            <button className="loginBtn" onClick={async () => { // BUTTON IS PRESSED, ACCOUNT IS SAVED, THEN DIRECT USER TO LOGIN
                let flag = 1;
                document.getElementById("usrW0").hidden = true;
                document.getElementById("usrW1").hidden = true;
                document.getElementById("pwdW0").hidden = true;
                document.getElementById("pwdW1").hidden = true;
                if (username === "") {
                    document.getElementById("usrW0").hidden = false;
                    flag = 0;
                }
                if (password === "") {
                    document.getElementById("pwdW0").hidden = false;
                }
                if (flag) {
                    const serverResponse = await model.post("http://localhost:8000/user", {username,password}, {withCredentials: true});
                    console.log("serverResponse.data: " + serverResponse.data);
                    if (serverResponse.data === "accessGranted") {
                        console.log("serverResponse.cookies: \n" + serverResponse.cookies);
                        setCookie({name: username, val: serverResponse.val});
                        userState(0);
                        nextState(0);
                    }
                    else {
                        document.getElementById(serverResponse.data).hidden = false;
                    }
                }
            }}>Login</button>
            <p className="mandatoryFieldsWarning">* indicates incorrect input for fields</p>
        </div>
    )
}