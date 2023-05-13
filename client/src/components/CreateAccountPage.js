import { useState } from "react";

export default function CreateAccountPage( {model, nextState} ) {

    const [newUsernameText, setNewUsernameText] = useState("");
    const [newPasswordText, setNewPasswordText] = useState("");
    const [newPasswordVerifiedText, setNewPasswordVerifiedText] = useState("");
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
                    }}>
                </input>
                <div id="usrW0" hidden={true}>
                    Please enter a valid username -- username field cannot be empty.
                </div>
                <div id="usrW1" hidden={true}>
                    An account already exists with this username. Please enter a different username.
                </div>
                <h3>Please enter your preferred password:</h3>
                <input className="newPasswordText"
                    value={newPasswordText}
                    onChange={(e) => {
                        setNewPasswordText(e.target.value);
                    }}>
                </input>
                <div id="pwdW0" hidden={true}>
                Please enter a valid password -- password field cannot be empty.
                </div>
                <div id="pwdW1" hidden={true}>
                    Please enter a valid password -- password cannot contain username.
                </div>
                <div id="pwdW2" hidden={true}>
                    Please enter a valid password -- password cannot contain email.
                </div>
                <div id="pwdW3" hidden={true}>
                    Passwords do not match.
                </div>
                <h3>Please re-enter your password:</h3>
                <input className="newPasswordVerifiedText"
                value={newPasswordVerifiedText}
                onChange={(e) => {
                    setNewPasswordVerifiedText(e.target.value);
                }}>
                </input>
                <div id="pwdW4" hidden={true}>
                    Passwords do not match.
                </div>
                <h3>Please enter an account name:</h3>
                <input className="newAccountNameText"
                value={newAccountNameText}
                pattern="[\w.!#$%&'*+-/=?^`{|}~]+@[A-Za-z0-9]+?[A-Za-z0-9.]*?.[A-Za-z]+"
                onChange={(e) => {
                    setNewAccountNameText(e.target.value);
                }}>
                </input>
                <div id="emailW0" hidden={true}>
                    Please enter a valid email address -- email field cannot be empty.
                </div>
                <div id="emailW1" hidden={true}>
                    Incorrect format for email address. Please enter a valid address.
                </div>
                <div id="emailW2" hidden={true}>
                    Account already registered under this email. Please enter a different email address.
                </div>
            </div>
            <button className="createAccountBtn" onClick={async () => { // BUTTON IS PRESSED, ACCOUNT IS SAVED, THEN DIRECT USER TO LOGIN
                document.getElementById("usrW0").hidden = true;
                document.getElementById("usrW1").hidden = true;
                document.getElementById("pwdW0").hidden = true;
                document.getElementById("pwdW1").hidden = true;
                document.getElementById("pwdW2").hidden = true;
                document.getElementById("emailW0").hidden = true;
                document.getElementById("emailW1").hidden = true;
                document.getElementById("emailW2").hidden = true;
                let patternMismatch = document.getElementsByClassName("newAccountNameText")[0].validity.patternMismatch;
                console.log(patternMismatch);
                let result = await processAccountInfo(model, patternMismatch, accounts, {
                    username: newUsernameText,
                    password: newPasswordText,
                    passwordV: newPasswordVerifiedText,
                    accountName: newAccountNameText
                });
                if (result === 1) { // credentials are valid, taking user to login page
                    nextState(7);
                }
            }}>Create Account</button>
            <p className="mandatoryFieldsWarning">* indicates incorrect input for fields</p>
        </div>
    )
}


async function processAccountInfo(model, patternMismatch, accounts, accInfo) {
    let newUsername = accInfo.username;
    let newPassword = accInfo.password;
    let newPasswordVerified = accInfo.passwordV;
    let newAccountName = accInfo.accountName;
    let errors = [];
    if (newUsername === undefined || newUsername.trim().length <= 0) {
        document.getElementById("usrW0").hidden = false;
        errors.push(-5);
    }
    if (newPassword === undefined || newPassword.trim().length <= 0) {
        document.getElementById("pwdW0").hidden = false;
        errors.push(-6);
    }
    if (newAccountName === undefined || newAccountName.trim().length <= 0) {
        document.getElementById("emailW0").hidden = false;
        errors.push(-7);
    }
    if (patternMismatch) {
        document.getElementById("emailW1").hidden = false;
        errors.push(-8);
    }
    if (accounts.find(({accountName}) => accountName === newAccountName)) {
        document.getElementById("emailW2").hidden = false;
        errors.push(-1);
    }
    if (accounts.find(({username}) => username === newUsername)) {
        document.getElementById("usrW1").hidden = false;
        errors.push(-2);;
    }
    if (newPassword.includes(newUsername) && newUsername.length !== 0) {
        document.getElementById("pwdW1").hidden = false;
        errors.push(-3);;
    }
    if (newPassword.includes(newAccountName) && newAccountName.length !== 0) {
        document.getElementById("pwdW2").hidden = false;
        errors.push(-4);
    }
    if (newPassword !== newPasswordVerified) {
        document.getElementById("pwdW3").hidden = false;
        document.getElementById("pwdW4").hidden = false;
        errors.push(-9);
    }
    if (errors.length !== 0) {
        return 0;
    }
    else {
        await model.post("http://localhost:8000/new_account", accInfo)
        .then(console.log("good"));
        return 1;
    }
};