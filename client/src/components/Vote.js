import { useState } from "react"

export default function Vote( {model, qid, aid} ) {
    const [update, setUpdate] = useState({val: 0, votes: 0});
    if (update["val"] === 0) {
        model.get(`http://localhost:8000/posts/${qid ? "question" : "answer"}/${qid ? qid : aid}/votes`).then((res) => {
            setUpdate({val: 1, votes: res.data["votes"]});
        })
    }
    return (
        <>
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
        </>
    )
}