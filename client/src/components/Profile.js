import axios from "axios";
import Tag from "./Tag";
import { useState } from "react"

export default function Profile( {setCurrentQuestion, nextState, setSideColor, setQuery, setEdit} ) {
    const [info, setInfo] = useState({update: 1, view: 0});
    if (info["update"] === 1) {
        axios.get("http://localhost:8000/profile", {
            params: {
                type: info["view"]
            },
            withCredentials: true
        }).then((res) => {
            setInfo({update: 0,
                     view: info.view,
                     name: res.data["name"],
                     dateCreated: res.data["dateCreated"],
                     rep: res.data["reputation"],
                     questions: res.data["questions"],
                     tags: res.data["tags"],
                     accounts: res.data["accounts"]
                    });
        }).catch((e) => {
            nextState(5);
        })
    }
    if (info.accounts) {
        displayUserAccounts(info.accounts, nextState, info, setInfo);
    }
    let questionTitles;
    if (info.view === 0 && info.questions) {
        questionTitles = info.questions.map((question) => {
            return <button key={question._id} className="profileQuestions" onClick={() => {
                setCurrentQuestion(question);
                nextState(2);
            }}>{question.title}</button>
        })
    }
    let userTags, tableContents;
    if (info.view === 1 && info.tags) {
        userTags = info.tags;
        // Split tags into groups of 3
        let tagGroups = [];
        let tagGroup = [];
        for (let i = 0; i < userTags.length; i++) {
            tagGroup.push(userTags[i]);
            if ((i % 3 === 2 && i) || i === userTags.length - 1) {
                tagGroups.push(tagGroup);
                tagGroup = [];
            }
        }
        // Build the table
        tableContents = tagGroups.map((tagGroup) => 
            <tr key={tagGroup[0]._id}>
                {tagGroup.map((tag) => 
                    <Tag tag={tag}
                        setSideColor={setSideColor}
                        setQuery={setQuery}
                        nextState={nextState}
                        profileView={setInfo}
                        key={tag._id}/>
                )}
            </tr>
        )
    }
    if (info.view === 2 && info.questions) {
        questionTitles = info.questions.map((question) => {
            return <button key={question._id} className="profileQuestions" onClick={() => {
                setCurrentQuestion(question);
                nextState(1);
                setEdit(true);
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
                        setInfo({...info, update: 1, view: 0})
                    }}>Questions</button>
                    <button className="profileBtn" style={{backgroundColor: info.view === 1 ? "rgb(241,242,243)" : "white"}} onClick={() => {
                        setInfo({...info, update: 1, view: 1})
                    }}>Tags</button>
                    <button className="profileBtn" style={{backgroundColor: info.view === 2 ? "rgb(241,242,243)" : "white"}} onClick={() => {
                        setInfo({...info, update: 1, view: 2})
                    }}>Answered Questions</button>
                </div>
                <div id="profileContent">
                    {info.view === 0 && questionTitles}
                    {info.view === 1 &&
                        <div className="tag bottom">
                            <table>
                                <tbody>{tableContents}</tbody>
                            </table>
                        </div>
                    }
                    {info.view === 2 && questionTitles}
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