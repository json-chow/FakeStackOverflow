import { useState } from "react";


export default function AskQuestion( {model, setSideColor, nextState, notLoggedIn, setUserState, setDbFailure} ) {
    const [titleText, setTitleText] = useState("");
    const [questionSummary, setQuestionSummary] = useState("");
    const [questionText, setQuestionText] = useState("");
    const [questionTags, setQuestionTags] = useState("");
    return (
        <div className="menu main">
            <div>
                <p className="askQHeader" style={{fontSize: "30px"}}>Question Title*</p>
                <p className="askQGuide" style={{fontSize: "15px"}}>Limit title to 50 characters or less</p>
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
                    Please enter a valid title -- title must not be empty and not more than 50 characters.
                </div>
            </div>
            <div>
                <p className="askQHeader" style={{fontSize: "30px"}}>Question Summary*</p>
                <p className="askQGuide" style={{fontSize: "15px"}}>Limit summary to 140 characters or less</p>
                <input className="questionSummary"
                    pattern="(\s*\S+\s*)+"
                    value={questionSummary}
                    onChange={(e) => {
                        setQuestionSummary(e.target.value);
                        document.getElementById("summaryError").hidden = true;
                        document.getElementById("summaryLinkError").hidden = true;
                        displayInvalidQInput(e);
                    }}>
                </input>
                <div id="summaryError" className="qError" hidden={true}>
                    Please enter a valid summary -- summary must not be empty and not more than 140 characters.
                </div>
                <div id="summaryLinkError" className="qError" hidden={true}>
                    Error with summary -- summary is empty or some hyperlink is invalid.
                </div>
            </div>
            <div className="question">
                <p className="askQHeader" style={{fontSize: "30px"}}>Question Text*</p>
                <p className="askQGuide">Add details</p>
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
                <p className="askQHeader">Tags*</p>
                <p className="askQGuide">Add keywords separated by whitespace</p>
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
            <button className="postQuestion" hidden={notLoggedIn} onClick={async () => {
                if (detectBadHyperlink("questionText")) {
                    document.getElementById("hyperlinkError").hidden = false;
                } else if (detectBadHyperlink("questionSummary")) {
                    document.getElementById("summaryLinkError").hidden = false;
                } else {
                    let result = await processQuestionPost(model, {
                        title: titleText,
                        summary: questionSummary,
                        text: questionText,
                        tagIds: Array(questionTags.trim().split(" ")),
                        askDate: Date.now(),
                    },
                    setDbFailure);
                    console.log(result)
                    if (result === 1) {
                        setSideColor(0);
                        nextState(0);
                    } else if (result === 2) {
                        setUserState(0);
                        nextState(5);
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
        } else if (cName === "questionSummary") {
            document.getElementById("summaryError").hidden = false;
        } else {
            document.getElementById("tagError").hidden = false;
        }
    } else {
        if (cName === "titleText" && e.target.value.length > 50) {
            document.getElementById("titleError").hidden = false;
        }
        if (cName === "questionSummary" && e.target.value.length > 140) {
            document.getElementById("summaryError").hidden = false;
        }
    }
}

function detectBadHyperlink(className) {
    let element = document.getElementsByClassName(className)[0];
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

async function processQuestionPost(model, candidateQuestion, setDbFailure) {
    var tMismatch = document.getElementsByClassName("titleText")[0].validity.patternMismatch;
    if (tMismatch || candidateQuestion.title.length === 0 || candidateQuestion.title.length > 50) {
        document.getElementById("titleError").hidden = false;
    }
    var sMismatch = document.getElementsByClassName("questionSummary")[0].validity.patternMismatch;
    if (sMismatch || candidateQuestion.summary.length === 0 || candidateQuestion.summary.length > 140) {
        document.getElementById("summaryError").hidden = false;
    }
    var qMismatch = document.getElementsByClassName("questionText")[0].validity.patternMismatch;
    if (qMismatch || candidateQuestion.text.length === 0) {
        document.getElementById("questionError").hidden = false;
    }
    var tagMismatch = document.getElementsByClassName("questionTags")[0].validity.patternMismatch;
    if (tagMismatch || candidateQuestion.tagIds[0][0] === "") {
        document.getElementById("tagError").hidden = false;
    }  
    var mismatch = tMismatch || sMismatch || qMismatch || tagMismatch;
    if (candidateQuestion.title.length <= 50
        && candidateQuestion.summary.length <= 140
        && candidateQuestion.title.trim().length >= 1
        && candidateQuestion.summary.trim().length >= 1
        && candidateQuestion.text.trim().length >= 1
        && candidateQuestion.tagIds.length >= 1
        && candidateQuestion.tagIds[0][0].trim().length >= 1
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
        try {
            await model.post("http://localhost:8000/new_question", candidateQuestion, {withCredentials: true});
            return 1;
        } catch (e) {
            console.log("bad session");
            setDbFailure("question");
            return 2;
        }
    } else {
        return 0;
    }
}