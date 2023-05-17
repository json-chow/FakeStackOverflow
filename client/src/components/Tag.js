import axios from "axios";
import React, { useState } from "react";

export default function Tag( {tag, questions, setSideColor, setQuery, nextState, profileView} ) {
    const [info, setInfo] = useState({update: 1, tag: tag})
    if (info.update === 1) {
        axios.get(`http://localhost:8000/tag/${tag._id}`, {withCredentials: true}).then((res) => {
            setInfo({update: 0, tag: res.data.tag, questions: res.data.questions})
        })
    }
    let btnRef = React.createRef();
    let inputRef = React.createRef();
    let badDeleteRef = React.createRef();
    let numQuestions = (info.tag && info.questions) && getCountByTag(info.questions, info.tag._id);
    let query;

    if (info.tag) {
        query = {
            nontags: [],
            tags: [info.tag.name.toLowerCase()],
            sortBy: undefined
        }
    }
    return (
        <>
            <td>
                <button ref={btnRef} onClick={() => {
                    setQuery(query);
                    setSideColor(0);
                    nextState(0);
                }}>
                    {info.tag && info.tag.name}
                </button>
                <input ref={inputRef} hidden={true} onKeyUp={(e) => {
                    if (e.key === "Enter") {
                        e.target.hidden = true;
                        btnRef.current.hidden = false;
                        axios.post(`http://localhost:8000/tag/${tag._id}/update`, {val: e.target.value}, {withCredentials: true}).then((res) => {
                            setInfo({update: 1, tag: res.data.tag})
                        }).catch((e) => nextState(5))
                    }
                }}></input>
                <div className="tagOpts">
                    <button onClick={() => {
                        inputRef.current.hidden = false;
                        btnRef.current.hidden = true;
                        badDeleteRef.current.hidden = true;
                    }}>Edit</button>
                    <button onClick={() => {
                        badDeleteRef.current.hidden = false;
                        axios.post(`http://localhost:8000/tag/${tag._id}/delete`, {}, {withCredentials: true}).then((res) => {
                            profileView({update: 1, view: 1})
                        }).catch((e) => {
                            if (e.response.status) {
                                badDeleteRef.current.true = false;
                            }
                        });
                    }}>Delete</button>
                    <div ref={badDeleteRef} hidden={true}>Unable to delete</div>
                </div>
                {!profileView && <div>{numQuestions + `${numQuestions === 1 ? " question" : " questions"}`}</div>}
            </td>
        </>
    )
}

function getCountByTag(questions, tid) {
    var count = 0;
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].tags.includes(tid)) {
        count++;
      }
    }
    return count;
}