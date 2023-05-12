import { useState } from "react";

export default function CreateAccountPage( {model, nextState} ) {

    const [newUsernameText, setNewUsernameText] = useState("");
    const [newPasswordText, setNewPasswordText] = useState("");
    const [newAccountNameText, setNewAccountNameText] = useState("");
    
    const [update, setUpdate] = useState({val: 0, accounts: []});
    if (update["val"] === 0) {
        model.get("http://localhost:8000/")
        .then((res) => {
            setUpdate({val:1, accounts: res.data["accounts"]})
        })
    }
    let accounts = update["accounts"];

    return (
        <div className="menu main">
            <h2 id="createAccountPrompt">Please fill out the fields below:</h2>
            <div className="menu main bottom">
                <h3>Please enter your preferred username:</h3>
                <input className="newUsernameText"
                    value={newUsernameText}
                    onChange={(e) => {
                        setNewUsernameText(e.target.value);
                        displayInvalidInput(e);
                    }}>
                </input>
                <p id="usernameNotEntered" className="usrW0" hidden={true}>
                    Please enter a valid username -- username must not be empty.
                </p>
                <p id="usernameInUse" className="usrW1" hidden={true}>
                    An account already exists with this username. Please enter a different username.
                </p>
                <h3>Please enter your preferred password:</h3>
                <input className="newPasswordText"
                    value={newPasswordText}
                    //pattern="*(!(\n))@gmail.com"
                    onChange={(e) => {
                        setNewPasswordText(e.target.value);
                        displayInvalidInput(e);
                    }}>
                </input>
                <p id="passwordNotEntered" className="pwdW0" hidden={true}>
                    Please enter a valid password -- password cannot contain the entered username or email address.
                </p>
                <p id="passwordContainsUsername" className="pwdW1" hidden={true}>
                    Please enter a valid password -- password cannot contain username.
                </p>
                <p id="passwordContainsEmail" className="pwdW2" hidden={true}>
                    Please enter a valid password -- password cannot contain username.
                </p>
                <h3>Please enter an account name:</h3>
                <input className="newAccountNameText"
                value={newAccountNameText}
                onChange={(e) => {
                    setNewAccountNameText(e.target.value);
                    displayInvalidInput(e);
                }}>
                </input>
                <p id="accountNameNotEntered" className="emailW0" hidden={true}>
                    Please enter a valid email address.
                </p>
                <p id="emailNotValid" className="emailW1" hidden={true}>
                    Please enter a valid email address.
                </p>
                <p id="emailInUse" className="emailW2" hidden={true}>
                    Please enter a valid email address.
                </p>
            </div>
            <button className="createAccountBtn" onClick={async () => { // BUTTON IS PRESSED, ACCOUNT IS SAVED, THEN DIRECT USER TO LOGIN
                let result = await processAccountInfo(model, accounts, {
                    username: newUsernameText,
                    password: newPasswordText,
                    accountName: newAccountNameText
                });
                if (result === 1) {
                    console.log(1 + " Success");
                    nextState(7);
                }
                else if (result === 0) {
                    console.log(0);
                }
                else if (result === -1) {
                    console.log(-1);
                }
                else if (result === -2) {
                    console.log(-2);
                }
                else if (result === -3) {
                    console.log(-3);
                }
                else if (result === -4) {
                    console.log(-4);
                }
                else {
                    console.log("Failure");
                }
            }}>Create Account</button>
        </div>
    )
}


function displayInvalidInput(e) {
    var cName = e.target.className;
    if (e.target.validity.patternMismatch) {
        if (cName === "usrW0") {
            document.getElementById("usernameNotEntered").hidden = false;
        } else if (cName === "usrW1") {
            document.getElementById("usernameInUse").hidden = false;
        } else if (cName === "pwdW0") {
            document.getElementById("passwordNotEntered").hidden = false;
        } else if (cName === "pwdW1") {
            document.getElementById("passwordContainsUsername").hidden = false;
        } else if (cName === "pwdW2") {
            document.getElementById("passwordContainsEmail").hidden = false;
        } else if (cName === "emailW0") {
            document.getElementById("accountNameNotEntered").hidden = false;
        } else if (cName === "emailW1") {
            document.getElementById("emailNotValid").hidden = false;
        } else if (cName === "emailW2") {
            document.getElementById("emailInUse").hidden = false;
        }
    }
}


async function processAccountInfo(model, accounts, accInfo) {
    let newUsername = accInfo.username;
    let newPassword = accInfo.password;
    let newAccountName = accInfo.accountName;
    if (newUsername === undefined || newUsername.trim().length <= 0) {
        document.getElementsByClassName("usrW0").hidden = false;
        return 0;
    }
    if (newPassword === undefined || newPassword.trim().length <= 0) {
        document.getElementsByClassName("pwdW0").hidden = false;
        return 0;
    }
    if (newAccountName === undefined || newAccountName.trim().length <= 0) {
        document.getElementsByClassName("emailW0").hidden = false;
        return 0;
    }
    let patternMismatch = 0;
    if (patternMismatch) {
        document.getElementsByClassName("emailW1").hidden = false;
    }
    if (accounts.find(({accountName}) => accountName === newAccountName)) {
        document.getElementsByClassName("emailW2").hidden = false;
        return -1;
    }
    if (accounts.find(({username}) => username === newUsername)) {
        document.getElementsByClassName("usrW1").hidden = false;
        return -2;
    }
    if (newPassword.includes(newUsername)) {
        document.getElementsByClassName("pwd1").hidden = false;
        return -3;
    }
    if (newPassword.includes(newAccountName)) {
        document.getElementsByClassName("pwd1").hidden = false;
        return -4;
    }
    await model.post("http://localhost:8000/", accInfo)
        .then(console.log("good"));
        return 1;
};