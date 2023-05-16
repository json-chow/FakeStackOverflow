import axios from "axios";
import { useState } from "react"

export default function Profile( {currentUsername, setCurrentUsername, setCurrentQuestion, nextState} ) {
    const [info, setInfo] = useState({update: 1, view: 0});
    if (info["update"] === 1) {
        axios.get("http://localhost:8000/profile", {withCredentials: true}).then((res) => {
            setInfo({update: 0,
                     view: info.view,
                     name: res.data["name"],
                     dateCreated: res.data["dateCreated"],
                     rep: res.data["reputation"],
                     questions: res.data["questions"],
                     accounts: res.data["accounts"]
                    });
        }).catch((e) => {
            nextState(5);
        })
    }
    console.log("info.accounts: " + info.accounts);
    if (info.accounts) {
        displayUserAccounts(info.accounts, nextState, info, setInfo);
    }
    let questionTitles;
    if (info.questions) {
        questionTitles = info.questions.map((question) => {
            console.log(question);
            return <button key={question._id} className="profileQuestions" onClick={() => {
                setCurrentQuestion(question);
                nextState(2);
            }}>{question.title}</button>
        })
    }
    return (
        <div className="menu main">
            <div className="menu main top">
                <div id="username">{info.name}</div>
                <div id="usercreationtime">{"Member for " + getDateDiff(info.dateCreated)}</div>
                <div id="reputation">{"Reputation: " + info.rep}</div>
            </div>
            <div className="menu main bottom">
                <div id="profileOptions">
                    <button className="profileBtn" style={{backgroundColor: info.view === 0 ? "rgb(241,242,243)" : "white"}} onClick={() => {
                        setInfo({...info, view: 0})
                    }}>Questions</button>
                    <button className="profileBtn" style={{backgroundColor: info.view === 1 ? "rgb(241,242,243)" : "white"}} onClick={() => {
                        setInfo({...info, view: 1})
                    }}>Tags</button>
                    <button className="profileBtn" style={{backgroundColor: info.view === 2 ? "rgb(241,242,243)" : "white"}} onClick={() => {
                        setInfo({...info, view: 2})
                    }}>Answered Questions</button>
                </div>
                <div id="profileContent">
                    {questionTitles}
                </div>
            </div>
        </div>
    )
}

function getDateDiff(date) {
    date = new Date(date);
    let dateDiff = Date.now() - date;
    if (dateDiff < 60 * 1000) { // less than a minute
        dateDiff = Math.trunc(dateDiff / 1000) + " seconds";
    } else if (dateDiff < 60 * 60 * 1000) { // less than an hour
        dateDiff = Math.trunc(dateDiff / (60 * 1000)) + " minutes"
    } else if (dateDiff < 24 * 60 * 60 * 1000) { // less than a day
        dateDiff = Math.trunc(dateDiff / (60 * 60 * 1000)) + " hours"
    } else if (dateDiff < 30 * 24 * 60 * 60 * 1000) { // less than a month
        dateDiff = Math.trunc(dateDiff / (24 * 60 * 60 * 1000)) + " days"
    } else if (dateDiff < 12 * 30.417 * 24 * 60 * 60 * 1000) { // less than a year
        dateDiff = Math.trunc(dateDiff / (30 * 24 * 60 * 60 * 1000)) + " months"
    } else { // more than a year
        let months = Math.trunc(dateDiff / (12 * 30.417 * 24 * 60 * 60 * 1000))
        dateDiff = Math.trunc(months / 12) + " years, " + months - (Math.trunc(months / 12) * 12) + " months"
    }
    return dateDiff
}

async function displayUserAccounts(accounts, nextState, info, setInfo) {
    let userProfiles;
    if (accounts) {
        userProfiles = accounts.map((account) => {
            console.log(account);
            return(
                <div>
                    <button key={account.username} className="userProfile" onClick={async () => {
                        axios.get("http://localhost:8000/profile", {withCredentials: true}, 
                        {params: {
                            username: account.username
                        }}
                        ).then((res) => {
                            setInfo({update: 0,
                                     view: info.view,
                                     name: res.data["name"],
                                     dateCreated: res.data["dateCreated"],
                                     rep: res.data["reputation"],
                                     questions: res.data["questions"],
                                     accounts: res.data["accounts"]
                                    });
                        }).catch((e) => {
                            nextState(5);
                        })
                    }}>{account.username}</button>
                    <button key={account.username} className="deleteUser" onClick={async () => {
                        await axios.post("http://localhost:8000/delete_account",
                        {params: {
                            username: account.username
                        }});
                    }}>{account.username}</button>
                </div>
            )
        });
        <div id="userProfiles">
            {userProfiles}
        </div>
    }
    else {
        <div>
            No user profiles in database.
        </div>
    }
}
