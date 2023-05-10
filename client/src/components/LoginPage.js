import { useState } from "react";

export default function LoginPage( {model, setSideColor, nextState} ) {
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
                <h3>Password:</h3>
                <input className="pwdTxt"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                    }}>
                </input>
            </div>
            <button className="loginBtn" onClick={async () => { // BUTTON IS PRESSED, ACCOUNT IS SAVED, THEN DIRECT USER TO LOGIN
            var flag = await credentialsValid(model,username,password)
            flag = 1;
                    if (flag === 1) {
                        nextState(0);
                        console.log(`${username} login successful.`)
                    }
                    else if (flag === 0) {
                        nextState(0);
                        console.log("Please provide your login information.");
                    }
                    else if (flag === -1) {
                        console.log(`No account registered with username: ${username}`);
                    }
                    else if (flag === -2) {
                        console.log("Password is incorrect, please try again.");
                    }
                    else {
                        console.log("ERROR!!!");
                    }
                    console.log(`${username} login failed.`);
            }}>Login</button>
            <p className="mandatoryFieldsWarning">* indicates mandatory fields</p>
        </div>
    )
}

async function credentialsValid(model,usr,pwd) {
    if (!usr || !pwd || usr.trim()<=0 || pwd.trim()<=0) {
        return 0;
    }
    var usernameExists = await model.get({username: usr, password: pwd});
    if (!usernameExists) {
        return -1;
    }
    var passwordExists = await model.get({username: usr, password: pwd});
    if (!passwordExists) {
        return -2;
    }
    return 1;
}