import Question from "./Question";
import { useState } from "react";

export default function QuestionForum( {model, query, setQuery, setSideColor, sortBy, setSortBy, nextState, setCurrentQuestion} ) {
    const [update, setUpdate] = useState({val: 0, questions: [], tags: [], answers: []})
    if (update["val"] === 0) {
        model.get("http://localhost:8000/")
            .then((res) => {
                setUpdate({val: 1, questions: res.data["questions"], tags: res.data["tags"], answers: res.data["answers"]})
            })
    }
    let questions = update["questions"];
    let answers = update["answers"];
    let tags = update["tags"];
    let questionRows;
    // Searching feature
    if (query.nontags.length !== 0 || query.tags.length !== 0) {
        let shown_questions = []
        for (let i = 0; i < questions.length; i++) {
            let title = questions[i].title.toLowerCase();
            let text = questions[i].text.toLowerCase();
            let pushed = 0;
            // Check if at least one non-tag word is in title or text
            for (let j = 0; j < query.nontags.length; j++) {
                let re = new RegExp("\\b" + query.nontags[j] + "\\b");
                if (title.match(re) || text.match(re)) {
                    shown_questions.push(questions[i]);
                    pushed = 1;
                    break;
                }
            }
            // Check if question contains tag word
            if (!pushed) {
                let questionTags = tagIdsToName(tags, questions[i].tags);
                for (let j = 0; j < query.tags.length; j++) {
                    if (questionTags.includes(query.tags[j])) {
                        shown_questions.push(questions[i]);
                        break;
                    }
                }
            }
        }
        questions = shown_questions
    }

    // Sorting feature
    if (sortBy === "active") {
        questions = [...questions].sort(function(a, b) {
            // Sort answers from most recently answered to least recent
            let a_ans = [...a.answers].sort((a, b) => getAnsDateFromAId(answers, b) - getAnsDateFromAId(answers, a));
            let b_ans = [...b.answers].sort((a, b) => getAnsDateFromAId(answers, b) - getAnsDateFromAId(answers, a));
            return getAnsDateFromAId(answers, b_ans[0]) - getAnsDateFromAId(answers, a_ans[0]);
        })
    } else if (sortBy === "unanswered") {
        questions = [...questions].sort((a, b) => strToDate(b.ask_date_time) - strToDate(a.ask_date_time));
        questions = questions.filter((question) => question.answers.length === 0);
    } else { // Default case -- newest
        questions = [...questions].sort((a, b) => strToDate(b.ask_date_time) - strToDate(a.ask_date_time));
    }

    if (questions.length === 0) {
        questionRows = <p id="noquestions">No Questions Found</p>;
    } else {
        questionRows = questions.map((question) => 
            <Question model={model} question={question} nextState={nextState} setCurrentQuestion={setCurrentQuestion} tags = {tags} key={question._id}/>
        )
    }
    return (
        <div className="menu main">
            <div className="menu main top">
                <div>
                    <h2>All Questions</h2>
                    <button id="askquestion" onClick={() => {
                        setSideColor(-1);
                        nextState(2);
                    }}>
                        Ask Question
                    </button>
                </div>
                <p>{questionRows.length ? questionRows.length : 0} questions</p>
                <button id="newest" onClick={() => {
                    setSortBy();
                    setQuery({nontags: [], tags:[]});
                    }}>Newest</button>
                <button id="active" onClick={() => {
                    setSortBy("active");
                    setQuery({nontags: [], tags:[]});
                    }}>Active</button>
                <button id="unanswered" onClick={() => {
                    setSortBy("unanswered");
                    setQuery({nontags: [], tags:[]});
                    }}>Unanswered</button>
            </div>
            <div className="menu main bottom">
                {questionRows}
            </div>
        </div>
    )
}

function getAnsDateFromAId(answers, aid) {
    for (let i = 0; i < answers.length; i++) {
      if (aid === answers[i]._id) {
        return new Date(answers[i].ans_date_time);
      }
    }
}

function tagIdsToName(tags, tids) {
    var names = []
    for (let i = 0; i < tids.length; i++) {
      for (let j = 0; j < tags.length; j++) {
        if (tids[i] === tags[j]._id) {
          names.push(tags[j].name.toLowerCase());
          break;
        }
      }
    }
    return names;
}

function strToDate(str) {
    return new Date(str);
}