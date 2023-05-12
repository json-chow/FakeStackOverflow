import Question from "./Question";
import { useState } from "react";

var prevQuery = {tags: [], nontags: [], sortBy: undefined};

export default function QuestionForum( {model, userState, query, setQuery, setSideColor, nextState, setCurrentQuestion} ) {
    const [update, setUpdate] = useState({val: 0, questions: [], tags: [], numQuestions: 0})
    const [page, setPage] = useState({page: 1, max: 1});
    if (update["val"] === 0 || page["update"] === 1) {
        model.get("http://localhost:8000/", {
            params: {
                tags: query.tags,
                nontags: query.nontags,
                sortBy: query.sortBy,
                page: page["page"],
                limit: 5
            }
        })
            .then((res) => {
                setUpdate({val: 1, questions: res.data["questions"], tags: res.data["tags"], numQuestions: res.data["questions"].pop()})
                setPage({page: page["page"], max: parseInt(res.data["maxPages"])});
            })
    }
    let showButton = false;
    if (userState === 'n' || userState === 'r') {
        showButton = true;
    }
    let questions = update["questions"];
    let tags = update["tags"];
    let numQuestions = update["numQuestions"];
    
    if (prevQuery === undefined) {
        prevQuery = query;
    }
    if (queryEquals(prevQuery, query) === false) {
        model.get("http://localhost:8000/", {
            params: {
                tags: query.tags,
                nontags: query.nontags,
                sortBy: query.sortBy,
                page: 1,
                limit: 5
            },
        })
            .then((res) => {
                setUpdate({val: 1, questions: res.data["questions"], tags: res.data["tags"], numQuestions: res.data["questions"].pop()})
                setPage({page: 1, max: res.data["maxPages"]});
            })
        prevQuery = query;
    }
    prevQuery = query;
    let questionRows;
    if (numQuestions === undefined || numQuestions === 0) {
        questionRows = <p id="noquestions">No Questions Found</p>;
    } else {
        questionRows = questions.map((question) => 
            <Question question={question} nextState={nextState} setCurrentQuestion={setCurrentQuestion} tags={tags} key={question._id}/>
        )
    }
    return (
        <div className="menu main">
            {update["val"] === 1 && <div className="menu main top">
                <div>
                    <h2>All Questions</h2>
                    <button id="askquestion" hidden={showButton} onClick={() => {
                        setSideColor(-1);
                        nextState(2);
                    }}>
                        Ask Question
                    </button>
                </div>
                <p>{numQuestions} questions</p>
                <button id="newest" onClick={() => {
                    setQuery({nontags: [], tags:[], sortBy: undefined});
                    }}>Newest</button>
                <button id="active" onClick={() => {
                    setQuery({nontags: [], tags:[], sortBy: "active"});
                    }}>Active</button>
                <button id="unanswered" onClick={() => {
                    setQuery({nontags: [], tags:[], sortBy: "unanswered"});
                    }}>Unanswered</button>
            </div>}
            {update["val"] === 1 && <div className="menu main bottom">
                {questionRows}
                {numQuestions > 5 && <button id="prevQ" onClick={() => {
                    if (page["page"] !== 1) {
                        setPage({update: 1, page: page["page"] - 1, max: page["max"]});
                    }
                    }}>Prev</button>}
                {numQuestions > 5 && <button id="nextQ" onClick={() => {
                    setPage({update: 1, page: (page["page"] % page["max"]) + 1, max: page["max"]});
                    }}>Next</button>}
            </div>}
        </div>
    )
}

function queryEquals(q1, q2) {
    if (q1.tags.length !== q2.tags.length || q1.nontags.length !== q2.nontags.length) {
        return false
    }
    if (q1.sortBy !== q2.sortBy) {
        return false
    }
    for (let i = 0; i < q1.tags.length; i++) {
        if (q1.tags[i] !== q2.tags[i]) {
            return false
        }
    }
    for (let i = 0; i < q1.nontags.length; i++) {
        if (q1.nontags[i] !== q2.nontags[i]) {
            return false
        } 
    }
    return true
}