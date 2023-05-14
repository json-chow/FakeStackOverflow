import React, { useState } from "react"

export default function Vote( {model, qid, aid, cid, nextState} ) {
    const [update, setUpdate] = useState({val: 0, votes: 0, vote: 0});
    if (update["val"] === 0) {
        if (cid === undefined) {
            model.get(`http://localhost:8000/posts/${qid ? "question" : "answer"}/${qid ? qid : aid}/votes`, {withCredentials: true}).then((res) => {
                setUpdate({val: 1, votes: res.data["votes"], vote: res.data["vote"]});
            })
        } else {
            model.get(`http://localhost:8000/comments/${cid}/votes`, {withCredentials: true}).then((res) => {
                setUpdate({val: 1, votes: res.data["votes"], vote: res.data["vote"]});
            })
        }
    }
    return (
        <>
            {cid === undefined && <>
                <button className="upvote" style={{borderBottomColor: update["vote"] === 1 ? "orange" : "darkgray"}} onClick={() => {
                    model.post(`http://localhost:8000/posts/${qid ? "question" : "answer"}/${qid ? qid : aid}/votes/1`, {}, {withCredentials: true}).then((res) => {
                        setUpdate({val: 0, votes: res.data["votes"]})
                    }).catch((res) => {
                        nextState(5);
                    })
                }}></button>
                <div className="voteNum">{update["votes"]} votes</div>
                <button className="downvote" style={{borderTopColor: update["vote"] === -1 ? "orange" : "darkgray"}} onClick={() => {
                    model.post(`http://localhost:8000/posts/${qid ? "question" : "answer"}/${qid ? qid : aid}/votes/-1`, {}, {withCredentials: true}).then((res) => {
                        setUpdate({val: 0, votes: res.data["votes"]})
                    }).catch((res) => {
                        nextState(5);
                    })
                }}></button>
            </>}
            {cid !== undefined && <>
                <button className="upvote" style={{borderBottomColor: update["vote"] === 1 ? "orange" : "darkgray"}} onClick={() => {
                    model.post(`http://localhost:8000/comments/${cid}/votes/1"}`, {}, {withCredentials: true}).then((res) => {
                        setUpdate({val: 0, votes: res.data["votes"]})
                    }).catch((res) => {
                        nextState(5);
                    })
                }}></button>
                <span className="voteNum">{update["votes"]}</span>
            </>}
        </>
    )
}