import { useState } from "react";
import Tag from "./Tag";

export default function TagPage( {model, setSideColor, setQuery, nextState, notLoggedIn} ) {
    const [update, setUpdate] = useState({val: 0, tags: [], questions: []})
    if (update["val"] === 0) {
    model.get("http://localhost:8000/tags")
        .then((res) => {
            setUpdate({val: 1, tags: res.data["tags"], questions: res.data["questions"]})
        })
    }
    // Split tags into groups of 3
    let tagGroups = [];
    let tagGroup = [];
    for (let i = 0; i < update["tags"].length; i++) {
        tagGroup.push(update["tags"][i]);
        if ((i % 3 === 2 && i) || i === update["tags"].length - 1) {
            tagGroups.push(tagGroup);
            tagGroup = [];
        }
    }
    
    // Build the table
    let tableContents = tagGroups.map((tagGroup) => 
        <tr key={tagGroup[0]._id}>
            {tagGroup.map((tag) => 
                <Tag tag={tag}
                    questions={update["questions"]}
                    setSideColor={setSideColor}
                    setQuery={setQuery}
                    nextState={nextState}
                    key={tag._id}/>
            )}
        </tr>
    )

    return (
        <div className="menu main">
            <div className="tag top">
                <p id="numTags">{update["tags"].length ? update["tags"].length : 0} Tags</p>
                <p id="allTags">All Tags</p>
                <button id="askquestion" hidden={notLoggedIn} onClick={() => {
                    setSideColor(-1);
                    nextState(2);
                }}>
                    Ask Question
                </button>
            </div>
            <div className="tag bottom">
                <table>
                    <tbody>{tableContents}</tbody>
                </table>
            </div>
        </div>
    )
}