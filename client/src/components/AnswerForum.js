import { useState } from 'react';
import Answer from './Answer.js';

export default function AnswerForum( {model, nextState, currentQuestion} ) {
    const [update, setUpdate] = useState({val: 0, answers: "", question: currentQuestion, numAnswers: 0, page: 1, max: 1, incViews: 1});
    let shown_answers;
    console.log(update["val"], update["page"]);
    if (update["val"] === 0) {
        model.get(`http://localhost:8000/posts/question/${currentQuestion._id}`, {
            params: {
                page: update["page"],
                limit: 5,
                incViews: update["incViews"]
            }
        })
            .then((res) => {
                let answers = res.data["answers"];
                currentQuestion = res.data["question"];
                shown_answers = answers.map((answer) => {
                    return <Answer key={answer._id} answer={answer}/>
                })
                setUpdate({val: 1, answers: shown_answers, question: res.data["question"], numAnswers: res.data["numAnswers"], page: update["page"], max: parseInt(res.data["maxPages"])});                
            })
    }
    let qText = currentQuestion.text;
    qText = replaceHyperlinks(qText);
    return (
        <div className="menu main">
            {update["val"] === 1 && <div className="menu main top">
                <div className="aqtcolumn">
                    <div className="aqtcolumn left">
                        <p>{update["numAnswers"] + " answers"}</p>
                    </div>
                    <div className="aqtcolumn mid">
                        <p>{currentQuestion.title}</p>
                    </div>
                </div>
            

                <div className="aqbcolumn">
                    <div className="aqbcolumn left">
                        <p>{`${update["question"].views} views`}</p>
                    </div>

                    <div className="aqbcolumn mid">
                        <p>{qText}</p>
                    </div>

                    <div className="aqbcolumn right">
                        <p id="qauthor">{currentQuestion.asked_by}</p>
                        <p>{getTimeString(currentQuestion.ask_date_time, "asked")}</p>
                    </div>
                </div>
            </div>}
            {update["val"] === 1 && <div className="menu main bottom">
                {update["answers"]}
                <div className="abuttoncolumn">
                    <button id="answerquestion" onClick={() => {
                        nextState(3);
                    }}>Answer Question</button>
                </div>
                {update["numAnswers"] > 5 && <button id="prevQ" onClick={() => {
                    if (update["page"] !== 1) {
                        setUpdate({val: 0, question: update["question"], page: update["page"] - 1, max: update["max"]});
                    }
                    }}>Prev</button>}
                {update["numAnswers"] > 5 && <button id="nextQ" onClick={() => {
                    setUpdate({val: 0, question: update["question"], page: (update["page"] % update["max"]) + 1, max: update["max"]});
                    }}>Next</button>}
            </div>}
        </div>
    )
}

function replaceHyperlinks(text) {
    let re = /\[([^\]]*?)\]\((.*?)\)/g;
    let matches = [...text.matchAll(re)];
    let newTextArr = [];
    let ind = 0;
    for (let i=0; i<matches.length; i++) {
        let match = matches[i][0];
        let atext = matches[i][1];
        let url = matches[i][2];
        let sind = matches[i].index;
        let eind = matches[i].index + match.length;
        newTextArr.push(text.slice(ind, sind));
        newTextArr.push(<a href={url}>{atext}</a>);
        ind = eind;
    }
    newTextArr.push(text.slice(ind, text.length));
    return newTextArr;
}

function getTimeString(time, type) {
    time = new Date(time);
    var dateDiff = Date.now() - time;
    const months = new Map([
      [0, "Jan"],
      [1, "Feb"],
      [2, "Mar"],
      [3, "Apr"],
      [4, "May"],
      [5, "Jun"],
      [6, "Jul"],
      [7, "Aug"],
      [8, "Sep"],
      [9, "Oct"],
      [10, "Nov"],
      [11, "Dec"],
    ]);
    let min = time.getMinutes();
    if (min < 10) {
      min = "0" + min;
    }
    let dateString;
    if (dateDiff < 60 * 1000) {
      dateString = " " + type + " " + Math.trunc(dateDiff / 1000) + " seconds ago";
    } else if (dateDiff < 60 * 60 * 1000) {
      dateString = " " + type + " " + Math.trunc(dateDiff / (60 * 1000)) + " minutes ago"
    } else if (dateDiff < 24 * 60 * 60 * 1000) {
      dateString = " " + type + " " + Math.trunc(dateDiff / (60 * 60 * 1000)) + " hours ago"
    } else if (dateDiff < 365 * 24 * 60 * 60 * 1000) {
      dateString = " " + type + " " + months.get(time.getMonth()) + " " + time.getDate()
      + " at " + time.getHours() + ":" + min;
    } else {
      dateString = " " + type + " " + months.get(time.getMonth()) + " " + time.getDate() + ", " + time.getFullYear()
      + " at " + time.getHours() + ":" + min;
    }
    return dateString;
}