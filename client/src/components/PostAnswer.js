
import { useState } from "react";

export default function PostAnswer( {model, qid, nextState, notLoggedIn} ) {
    const [answerText, setAnswerText] = useState("");
    const [answerUsernameText, setAnswerUsernameText] = useState("");

    return (
        <div className="menu main">
            <div>
                <p className="answerUsernameHeader">Username*</p>
                <input className="answerUsernameText"
                    pattern="(\s*\S+\s*)+"
                    value={answerUsernameText}
                    onChange={(e) => {
                        setAnswerUsernameText(e.target.value);
                        document.getElementById("aUserError").hidden = true;
                        displayInvalidAInput(e);
                    }}>
                </input>
                <div id="aUserError" className="aError" hidden={true}>
                    Username not long enough, must be at least 1 character (excluding whitespace).
                </div>
            </div>
            <div>
                <p className="answerSectionHeader">Answer Text*</p>
                <textarea id="answerTextId"
                    className="answerText"
                    pattern="(\s*\S+\s*)+"
                    value={answerText}
                    onChange={(e) => {
                        setAnswerText(e.target.value);
                        document.getElementById("answerError").hidden = true;
                        document.getElementById("ahyperlinkError").hidden = true;
                        e.target.style.border = "1px solid black";
                        displayInvalidAInput(e);
                    }}>
                </textarea>
                <div id="answerError" className="aError" hidden={true}>
                    Answer not long enough, must be at least 1 character (excluding whitespace).
                </div>
                <div id="ahyperlinkError" className="aError" hidden={true}>
                    Answer error -- answer is empty or some hyperlink is invalid
                </div>
            </div>
            <button className="postAnswer" hidden={notLoggedIn} onClick={async () => {
                if (detectBadHyperlink()) {
                    document.getElementById("ahyperlinkError").hidden = false;
                } else {
                    let result = await processAnswerPost(
                        model,
                        {
                        text: answerText,
                        ansBy : answerUsernameText,
                        ansDate : new Date()
                    }, qid);
                    if (result) {
                        nextState(1);
                    }
                }
            }}>Post Answer</button>
            <div className="answerMandatoryFieldsWarning">* indicates mandatory fields</div>
        </div>
    )
}

function displayInvalidAInput(e) {
    var cName = e.target.className;
    if (e.target.validity.patternMismatch) {
        if (cName === "answerUsernameText") {
            document.getElementById("aUserError").hidden = false;
        } 
    }
    if (cName === "answerText") {
        var re = /(\s*\S+\s*)+/g;
        if (!document.getElementById(e.target.id).value.match(re)) {
            e.target.style.border = "2px solid red";
            document.getElementById("answerError").hidden = false;
        }
    }
}

function detectBadHyperlink() {
    let element = document.getElementById("answerTextId");
    let re = /\[[^\]]*?\]\((.*?)\)/g;
    let matches = [...element.value.matchAll(re)];
    for (let i=0; i<matches.length; i++) {
        let link = matches[i][1];
        let link_re = /^http(s)?:\/\/.*/g;
        if (!link.match(link_re)) {
            return 1;
        }
    }
    return 0;
}

async function processAnswerPost(model, candidateAnswer, qid) {
    var ansUserMismatch = document.getElementsByClassName("answerUsernameText")[0].validity.patternMismatch;
    var ansMismatch = document.getElementsByClassName("answerText")[0].validity.patternMismatch;
    var mismatch = ansUserMismatch || ansMismatch;
    if (ansUserMismatch || candidateAnswer.ansBy === "") {
      document.getElementById("aUserError").hidden = false;
    }
    if (!document.getElementById("answerTextId").value.match(/(\s*\S+\s*)+/g) || candidateAnswer.text === undefined) {
      document.getElementById("answerError").hidden = false;
    }
    
    if (candidateAnswer.ansBy !== undefined &&
        candidateAnswer.text !== undefined &&
        candidateAnswer.ansBy.trim().length > 0 &&
        candidateAnswer.text.trim().length > 0 &&
        !mismatch){
        await model.post("http://localhost:8000/new_answer", {candidateAnswer, qid: qid})
      return 1;
    } else {
      return 0;
    }
}
