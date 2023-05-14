
import { useState } from "react";

export default function PostAnswer( {model, qid, nextState, notLoggedIn} ) {
    const [answerText, setAnswerText] = useState("");

    return (
        <div className="menu main">
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
                    let result = await processAnswerPost(model, {text: answerText, ansDate : new Date()}, qid);
                    if (result === 1) {
                        nextState(1);
                    } else if (result === 2) {
                        nextState(5);
                    }
                }
            }}>Post Answer</button>
            <div className="answerMandatoryFieldsWarning">* indicates mandatory fields</div>
        </div>
    )
}

function displayInvalidAInput(e) {
    var cName = e.target.className;
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
    var ansMismatch = document.getElementsByClassName("answerText")[0].validity.patternMismatch;
    if (!document.getElementById("answerTextId").value.match(/(\s*\S+\s*)+/g) || candidateAnswer.text === undefined) {
      document.getElementById("answerError").hidden = false;
    }
    
    if (candidateAnswer.text !== undefined && candidateAnswer.text.trim().length > 0 && !ansMismatch){
        try {
            await model.post("http://localhost:8000/new_answer", {candidateAnswer, qid: qid}, {withCredentials: true})
            return 1;
        } catch (e) {
            return 2;
        }
    } else {
        return 0;
    }
}
