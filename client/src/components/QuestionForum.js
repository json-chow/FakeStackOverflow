import Question from "./Question";
import { useState } from "react";

var prevQuery = {tags: [], nontags: [], sortBy: undefined};

export default function QuestionForum( {model, query, setQuery, setSideColor, nextState, setCurrentQuestion} ) {
    const [update, setUpdate] = useState({val: 0, questions: [], tags: []})
    if (update["val"] === 0) {
        model.get("http://localhost:8000/", {
            params: {
                tags: query.tags,
                nontags: query.nontags,
                sortBy: query.sortBy
            }
        })
            .then((res) => {
                setUpdate({val: 1, questions: res.data["questions"], tags: res.data["tags"]})
            })
    }
    let questions = update["questions"];
    let tags = update["tags"];

    if (queryEquals(prevQuery, query) === false) {
        if (prevQuery === undefined) {
            prevQuery = query;
        }
        model.get("http://localhost:8000/", {
            params: {
                tags: query.tags,
                nontags: query.nontags,
                sortBy: query.sortBy
            },
        })
            .then((res) => {
                setUpdate({val: 1, questions: res.data["questions"], tags: res.data["tags"]})
            })
        prevQuery = query;
    }
    prevQuery = query;
    let questionRows;
    if (questions.length === 0) {
        questionRows = <p id="noquestions">No Questions Found</p>;
    } else {
        questionRows = questions.map((question) => 
            <Question question={question} nextState={nextState} setCurrentQuestion={setCurrentQuestion} tags={tags} key={question._id}/>
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
                    setQuery({nontags: [], tags:[], sortBy: undefined});
                    }}>Newest</button>
                <button id="active" onClick={() => {
                    setQuery({nontags: [], tags:[], sortBy: "active"});
                    }}>Active</button>
                <button id="unanswered" onClick={() => {
                    setQuery({nontags: [], tags:[], sortBy: "unanswered"});
                    }}>Unanswered</button>
            </div>
            <div className="menu main bottom">
                {questionRows}
            </div>
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