import { useState } from "react";

export default function CreateAccountPage( {model, nextState} ) {
    //let accounts = update["accounts"];

    const [newUsernameText, setNewUsernameText] = useState("");
    const [newPasswordText, setNewPasswordText] = useState("");
    const [newAccountNameText, setNewAccountNameText] = useState("");
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
                <h3>Please enter your preferred password:</h3>
                <input className="newPasswordText"
                    value={newPasswordText}
                    onChange={(e) => {
                        setNewPasswordText(e.target.value);
                    }}>
                </input>
                <h3>Please enter an account name:</h3>
                <input className="newAccountNameText"
                value={newAccountNameText}
                onChange={(e) => {
                    setNewAccountNameText(e.target.value);
                }}>
                </input>
            </div>
            <button className="createAccountBtn" onClick={async () => { // BUTTON IS PRESSED, ACCOUNT IS SAVED, THEN DIRECT USER TO LOGIN
                {
                    /*
                    let result = await processAccountInfo(model, {
                        username: newUsernameText,
                        password: newPasswordText,
                        accountName: newAccountNameText
                    }); 
                    */
                    if (1) {
                        console.log(1 + " Success");
                        nextState(7);
                    }
                    else {
                        console.log(1 + " Failure");
                    }
                }
            }}>Create Account</button>
            <p className="mandatoryFieldsWarning">* indicates mandatory fields</p>
        </div>
    )
}

/*
async function processAccountInfo(model, account) {
    console.log(account);
    if (account.username === undefined || account.username.trim().length <= 0 ||
        account.password === undefined || account.password.trim().length <= 0 ||
        account.accountName === undefined || account.accountName.trim().length <= 0) {
        return 0;
    }
    await model.post("http://localhost:8000/new_account", account)
        .then(console.log("good"));
        return 1;
};

*/