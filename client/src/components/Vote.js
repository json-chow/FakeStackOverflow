import { useState } from "react"

export default function Vote( {model, qid, aid, cid} ) {
    const [update, setUpdate] = useState({val: 0, votes: 0});
    if (update["val"] === 0) {
        if (cid === undefined) {
            model.get(`http://localhost:8000/posts/${qid ? "question" : "answer"}/${qid ? qid : aid}/votes`).then((res) => {
                setUpdate({val: 1, votes: res.data["votes"]});
            })
        } else {
            model.get(`http://localhost:8000/comments/${cid}/votes`).then((res) => {
                setUpdate({val: 1, votes: res.data["votes"]});
            })
        }
    }
    return (
        <>
            {cid === undefined && <>
                <button className="upvote" onClick={() => {
                    model.post(`http://localhost:8000/posts/${qid ? "question" : "answer"}/${qid ? qid : aid}/votes/1`).then((res) => {
                        setUpdate({val: 0, votes: res.data["votes"]})
                    })
                }}></button>
                <div className="voteNum">{update["votes"]} votes</div>
                <button className="downvote" onClick={() => {
                    model.post(`http://localhost:8000/posts/${qid ? "question" : "answer"}/${qid ? qid : aid}/votes/-1`).then((res) => {
                        setUpdate({val: 0, votes: res.data["votes"]})
                    })
                }}></button>
            </>}
            {cid !== undefined && <>
                <button className="upvote" onClick={() => {
                    model.post(`http://localhost:8000/comments/${cid}/votes/1"}`).then((res) => {
                        setUpdate({val: 0, votes: res.data["votes"]})
                    })
                }}></button>
                <span className="voteNum">{update["votes"]}</span>
            </>}
        </>
    )
}