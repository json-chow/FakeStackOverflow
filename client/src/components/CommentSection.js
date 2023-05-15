import React, { useState } from "react"
import Comment from "./Comment";

export default function CommentSection( {model, qid, aid, nextState, notLoggedIn, setDbFailure} ) {
    const [update, setUpdate] = useState({val: 0, page: 1, max: 1});
    const [cmntVal, setCmntVal] = useState("");
    let addCmntRef = React.createRef();
    let inputRef = React.createRef();
    let inputBtnRef = React.createRef();
    let inputErrRef = React.createRef();
    let inputLinkErrRef = React.createRef();
    
    if (update["val"] === 0) {
        model.get(`http://localhost:8000/posts/${qid ? "question" : "answer"}/${qid ? qid : aid}/comments`, {
            params: {
                cpage: update["page"]
            }}).then((res) => {
                let comments = res.data["comments"];
                let shown_cmnts = comments.map((comment) => 
                    <Comment key={comment._id} model={model} comment={comment} nextState={nextState}/>
                )
                setUpdate({val: 1, cmnts: shown_cmnts, page: update["page"], max: res.data["maxPages"]});
            }
        )
    }

    let postComment = async function() {
        let input = inputRef.current;
        if (detectBadHyperlink(cmntVal)) {
            inputLinkErrRef.current.hidden = false;
        }
        if (input.validity.patternMismatch || cmntVal.length > 140 || cmntVal.length === 0) {
            inputErrRef.current.hidden = false;
            inputRef.current.style.border = "1px solid red";
        } else {
            try {
                await model.post(`http://localhost:8000/posts/${qid ? "question" : "answer"}/${qid ? qid : aid}/comments`, {
                    text: cmntVal,
                    cmnt_by: "userseven", // TODO: To be replaced by actual user,
                    cmnt_date_time: Date.now()}, {withCredentials: true});
                addCmntRef.current.hidden = false;
                inputRef.current.hidden = true;
                inputBtnRef.current.hidden = true;
                setUpdate({val: 0, page: 1})
                setCmntVal("");
            } catch (e) {
                setDbFailure("comment");
                nextState(5);
            }
        }
    }
    return (
        <>
            {update["cmnts"]}
            {(update["cmnts"] && update["cmnts"].length !== 0) && <div className='cmnt'></div>}
            <div style={{float: "right"}}>
                {update["max"] > 1 && <button className='prevCmnt' onClick={() => {
                    if (update["page"] !== 1) {
                        setUpdate({...update, val: 0, page: update["page"] - 1});
                    }
                }}>Prev</button>}
                {update["max"] > 1 && <button className='nextCmnt' onClick={() => {
                    setUpdate({...update, val: 0, page: (update["page"] % update["max"]) + 1})
                }}>Next</button>}
            </div>
            <button className="addcmnt" ref={addCmntRef} hidden={notLoggedIn} onClick={(e) => {
                e.target.hidden = true;
                inputRef.current.hidden = false;
                inputBtnRef.current.hidden = false;
            }}>
                Add comment...
            </button>
            <input ref={inputRef}
                    className="cmntInput"
                    value={cmntVal}
                    style={{width: "65%"}}
                    pattern="(\s*\S+\s*)+"
                    hidden={true}
                    onChange={(e) => {
                        setCmntVal(e.target.value);
                        if (e.target.validity.patternMismatch || e.target.value.length > 140) {
                            inputErrRef.current.hidden = false;
                            e.target.style.border = "1px solid red"
                        } else {
                            inputErrRef.current.hidden = true;
                            inputLinkErrRef.current.hidden = true;
                            e.target.style.border = "1px solid black"
                        }
                    }}
                    onKeyUp={(e) => {
                        if (e.key === "Enter") {
                            postComment();
                        }
                    }}>
            </input>
            <button ref={inputBtnRef} hidden={true} onClick={postComment}>
                Add Comment
            </button>
            <div ref={inputErrRef} style={{color: "red"}} hidden={true}>
                Comment must not be empty and must not be more than 140 characters.
            </div>
            <div ref={inputLinkErrRef} style={{color: "red"}} hidden={true}>
                Error with hyperlink in comment.
            </div>
        </>
    )
}

function detectBadHyperlink(text) {
    let re = /\[[^\]]*?\]\((.*?)\)/g;
    let matches = [...text.matchAll(re)];
    for (let i=0; i<matches.length; i++) {
        let link = matches[i][1];
        let link_re = /^http(s)?:\/\/.*/g;
        if (!link.match(link_re)) {
            return 1;
        }
    }
    return 0;
}