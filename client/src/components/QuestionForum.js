import Question from "./Question";
import { useState } from "react";

var prevQuery = {tags: [], nontags: [], sortBy: undefined};

export default function QuestionForum( {model, query, setQuery, setSideColor, nextState, notLoggedIn, setCurrentQuestion, setEdit} ) {
    const [update, setUpdate] = useState({val: 0, questions: [], tags: [], numQuestions: 0, page: 1, max: 1});
    if (update["val"] === 0) {
        model.get("http://localhost:8000/", {
            params: {
                tags: query.tags,
                nontags: query.nontags,
                sortBy: query.sortBy,
                page: update["page"]
            },
            withCredentials: true
        })
            .then((res) => {
                setUpdate({val: 1,
                           questions: res.data["questions"],
                           tags: res.data["tags"],
                           numQuestions: res.data["questions"].pop(),
                           page: update["page"],
                           max: parseInt(res.data["maxPages"])})
            })
    }
    let questions = update["questions"];
    let tags = update["tags"];
    let numQuestions = update["numQuestions"];
    
    if (prevQuery === undefined) {
        prevQuery = query;
    }
    if (queryEquals(prevQuery, query) === false || query.reset !== undefined) {
        model.get("http://localhost:8000/", {
            params: {
                tags: query.tags,
                nontags: query.nontags,
                sortBy: query.sortBy,
                page: 1
            },
            withCredentials: true
        })
            .then((res) => {
                setQuery({...query, reset: undefined})
                setUpdate({val: 1,
                           questions: res.data["questions"],
                           tags: res.data["tags"],
                           numQuestions: res.data["questions"].pop(),
                           page: 1,
                           max: res.data["maxPages"]});
            })
        prevQuery = query;
    }
    prevQuery = query;
    let questionRows;
    if (numQuestions === undefined || numQuestions === 0) {
        questionRows = <p id="noquestions">No Questions Found</p>;
    } else {
        questionRows = questions.map((question) => 
            <Question question={question} nextState={nextState} setCurrentQuestion={setCurrentQuestion} tags={tags} setEdit={setEdit} key={question._id}/>
        )
    }
    return (
        <div className="menu main">
            {update["val"] === 1 && <div className="menu main top">
                <div>
                    <h2>All Questions</h2>
                    <button id="askquestion" hidden={notLoggedIn} onClick={async () => {
                        try {
                            await model.get("http://localhost:8000/homepage", {withCredentials: true});
                            setSideColor(-1);
                            setCurrentQuestion(0);
                            nextState(2);
                        } catch (e) {
                            setCurrentQuestion(0);
                            nextState(5);
                        }
                        
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
                    if (update["page"] !== 1) {
                        setUpdate({val: 0, page: update["page"] - 1, max: update["max"]});
                    }
                    }}>Prev</button>}
                {numQuestions > 5 && <button id="nextQ" onClick={() => {
                    setUpdate({val: 0, page: (update["page"] % update["max"]) + 1, max: update["max"]});
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