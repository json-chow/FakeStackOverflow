import { useState } from "react";


export default function AskQuestion( {model, setSideColor, nextState} ) {
    const [titleText, setTitleText] = useState("");
    const [questionText, setQuestionText] = useState("");
    const [usernameText, setUsernameText] = useState("");
    const [questionTags, setQuestionTags] = useState("");
    return (
        <div className="menu main">
            <div>
                <p className="questionTitleHeader" style={{fontSize: "30px"}}>Question Title*</p>
                <p className="subtitle" style={{fontSize: "15px"}}>Limit title to 100 characters or less</p>
                <input className="titleText"
                    pattern="(\s*\S+\s*)+"
                    value={titleText}
                    onChange={(e) => {
                        setTitleText(e.target.value);
                        document.getElementById("titleError").hidden = true;
                        displayInvalidQInput(e);
                    }}>
                </input>
                <div id="titleError" className="qError" hidden={true}>
                    Please enter a valid title -- title must not be empty and not more than 100 characters.
                </div>
            </div>
            <div className="question">
                <p className="questionTextHeader" style={{fontSize: "30px"}}>Question Text*</p>
                <p className="addDetailsHeader">Add details</p>
                <input className="questionText"
                    pattern="(\s*\S+\s*)+"
                    value={questionText}
                    onChange={(e) => {
                        setQuestionText(e.target.value);
                        document.getElementById("questionError").hidden = true;
                        document.getElementById("hyperlinkError").hidden = true;
                        displayInvalidQInput(e);
                    }}>
                </input>
                <div id="questionError" className="qError" hidden={true}>
                    Please enter a valid question -- question must not be empty.
                </div>
                <div id="hyperlinkError" className="qError" hidden={true}>
                    Question error -- question is empty or some hyperlink is invalid.
                </div>
            </div>
            <div>
                <p className="questionTagsHeader">Tags*</p>
                <p className="addKeywordsHeader">Add keywords separated by whitespace</p>
                <input className="questionTags"
                    pattern="\s*(\S{1,10}\s+){0,4}\S{1,10}\s*"
                    value={questionTags}
                    onChange={(e) => {
                        setQuestionTags(e.target.value);
                        document.getElementById("tagError").hidden = true;
                        displayInvalidQInput(e);
                    }}>
                </input>
                <div id="tagError" className="qError" hidden={true}>
                    Enter between 1 to 5 tags, each at most 10 characters long.
                </div>
            </div>
            <div>
                <p className="usernameHeader">Username*</p>
                <input className="usernameText"
                    pattern="(\s*\S+\s*)+"
                    value={usernameText}
                    onChange={(e) => {
                        setUsernameText(e.target.value);
                        document.getElementById("userError").hidden = true;
                        displayInvalidQInput(e);
                    }}>
                </input>
                <div id="userError" className="qError" hidden={true}>
                    Please enter a valid username -- username must not be empty.
                </div>
            </div>
            <button className="postQuestion" onClick={async () => {
                if (detectBadHyperlink()) {
                    document.getElementById("hyperlinkError").hidden = false;
                } else {
                    let result = await processQuestionPost(model, {
                        title: titleText,
                        text: questionText,
                        tagIds: Array(questionTags.trim().split(" ")),
                        askedBy : usernameText,
                        askDate: Date.now(),
                    });
                    if (result) {
                        setSideColor(0);
                        nextState(0);
                    }
                }
            }}>Post Question</button>
            <p className="mandatoryFieldsWarning">* indicates mandatory fields</p>
        </div>
    )
}

function displayInvalidQInput(e) {
    var cName = e.target.className;
    if (e.target.validity.patternMismatch) {
        if (cName === "titleText") {
            document.getElementById("titleError").hidden = false;
        } else if (cName === "questionText") {
            document.getElementById("questionError").hidden = false;
        } else if (cName === "questionTags") {
            document.getElementById("tagError").hidden = false;
        } else {
            document.getElementById("userError").hidden = false;
        }
    } else {
        if (cName === "titleText" && e.target.value.length > 100) {
            document.getElementById("titleError").hidden = false;
        }
    }
}

function detectBadHyperlink() {
    let element = document.getElementsByClassName("questionText")[0];
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

async function processQuestionPost(model, candidateQuestion) {
    var tMismatch = document.getElementsByClassName("titleText")[0].validity.patternMismatch;
    if (tMismatch || candidateQuestion.title.length === 0 || candidateQuestion.title.length > 100) {
        document.getElementById("titleError").hidden = false;
    }
    var qMismatch = document.getElementsByClassName("questionText")[0].validity.patternMismatch;
    if (qMismatch || candidateQuestion.text.length === 0) {
        document.getElementById("questionError").hidden = false;
    }
    var tagMismatch = document.getElementsByClassName("questionTags")[0].validity.patternMismatch;
    if (tagMismatch || candidateQuestion.tagIds[0][0] === "") {
        document.getElementById("tagError").hidden = false;
    }  
    var uMismatch = document.getElementsByClassName("usernameText")[0].validity.patternMismatch;
    if (uMismatch || candidateQuestion.askedBy.length === 0) {
        document.getElementById("userError").hidden = false;
    }  
    var mismatch = tMismatch || qMismatch || tagMismatch || uMismatch;
    if (candidateQuestion.title.length <= 100
        && candidateQuestion.title.trim().length >= 1
        && candidateQuestion.text.trim().length >= 1
        && candidateQuestion.tagIds.length >= 1
        && candidateQuestion.tagIds[0][0].trim().length >= 1
        && candidateQuestion.askedBy.trim().length >= 1
        && !mismatch) {
        var tempList = [];
        var i = 0;
        var j = 0;
        while (i < candidateQuestion.tagIds[0].length) {
            if (candidateQuestion.tagIds[0][i].trim() !== "") {
                tempList[j++] = candidateQuestion.tagIds[0][i].trim();
            }
            i++;
        }
        candidateQuestion.tagIds[0] = tempList;
        console.log(candidateQuestion);
        await model.post("http://localhost:8000/new_question", candidateQuestion)
            .then(console.log("good"));
        console.log("1");
        return 1;
    } else {
        return 0;
    }
}