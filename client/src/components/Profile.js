import axios from "axios";
import { useState } from "react"

export default function Profile( {setCurrentQuestion, nextState} ) {
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
    const [currentProfile, setCurrentProfile] = useState({username: info.name});
    let questionTitles;
    let userProfiles;
    console.log("info.accounts: " + info.accounts);
    if (info.questions) {
        questionTitles = info.questions.map((question) => {
            console.log(question);
            return <button key={question._id} className="profileQuestions" onClick={() => {
                setCurrentQuestion(question);
                nextState(2);
            }}>{question.title}</button>
        })
    }
    // Admin:
    if (info.accounts) {
        //return displayUserAccounts(info.accounts, nextState, info, setInfo);
        userProfiles = info.accounts.map((account) => {
            return ( 
                <button key={account._id} className="userProfiles" onClick={async() => {
                    setCurrentProfile(account);
                }}>{account.username}</button>
            );
        });

        return (
            <div className="menu main">
                <div className="menu main top">
                    <div id="username">{info.name}</div>
                    <div id="usercreationtime">{"Member for " + getDateDiff(info.dateCreated)}</div>
                    <div id="reputation">{"Reputation: " + info.rep}</div>
                </div>
                <div className="menu main bottom">
                    <div id="profileOptions">
                        <div>
                            <button className="profileBtn" style={{backgroundColor: info.view === 0 ? "rgb(241,242,243)" : "white"}} onClick={() => {
                                setInfo({...info, view: 0});
                            }}>Users</button>
                            <div>
                                {userProfiles}
                            </div>
                        </div>
                        <div>
                            <div id="profileOptions">
                                <div>
                                    <button className="profileBtn" style={{backgroundColor: info.view === 1 ? "rgb(241,242,243)" : "white"}} onClick={() => {
                                        setInfo({...info, view: 1})
                                    }}>Questions 
                                    </button>
                                    <div id="profileContent">
                                        {questionTitles}
                                    </div>
                                </div>
                            <div>
                                <button className="profileBtn" style={{backgroundColor: info.view === 2 ? "rgb(241,242,243)" : "white"}} onClick={() => {
                                    setInfo({...info, view: 2})
                                }}>Tags
                                </button>
                                <div>
                                    
                                </div>
                            </div>
                            <div>
                                <button className="profileBtn" style={{backgroundColor: info.view === 3 ? "rgb(241,242,243)" : "white"}} onClick={() => {
                                    setInfo({...info, view: 3})
                                }}>Answered Questions</button>
                                    <div>
                                        
                                    </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    // User:
    return (
        <div className="menu main">
            <div className="menu main top">
                <div id="username">{info.name}</div>
                <div id="usercreationtime">{"Member for " + getDateDiff(info.dateCreated)}</div>
                <div id="reputation">{"Reputation: " + info.rep}</div>
            </div>
            <div className="menu main bottom">
                <div id="profileOptions">
                    <div>
                        <button className="profileBtn" style={{backgroundColor: info.view === 0 ? "rgb(241,242,243)" : "white"}} onClick={() => {
                            setInfo({...info, view: 0})
                        }}>Questions</button>
                        <div>{questionTitles}</div>
                    </div>
                    <button className="profileBtn" style={{backgroundColor: info.view === 1 ? "rgb(241,242,243)" : "white"}} onClick={() => {
                        setInfo({...info, view: 1})
                    }}>Tags</button>
                    <button className="profileBtn" style={{backgroundColor: info.view === 2 ? "rgb(241,242,243)" : "white"}} onClick={() => {
                        setInfo({...info, view: 2})
                    }}>Answered Questions</button>
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