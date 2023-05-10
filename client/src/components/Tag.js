export default function Tag( {model, tag, questions, setSideColor, setQuery, setSortBy, nextState} ) {
    let numQuestions = getCountByTag(questions, tag._id);
    let query = {
        nontags: [],
        tags: [tag.name.toLowerCase()]
    }
    return (
        <>
            <td>
                <button onClick={() => {
                    setQuery(query);
                    setSortBy("");
                    setSideColor(0);
                    nextState(0);
                }}>
                    {tag.name}
                </button>
                <div>{numQuestions + `${numQuestions === 1 ? " question" : " questions"}`}</div>
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