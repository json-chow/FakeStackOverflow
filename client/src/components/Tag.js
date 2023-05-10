export default function Tag( {tag, questions, setSideColor, setQuery, nextState} ) {
    let numQuestions = getCountByTag(questions, tag._id);
    let query = {
        nontags: [],
        tags: [tag.name.toLowerCase()],
        sortBy: undefined
    }
    return (
        <>
            <td>
                <button onClick={() => {
                    setQuery(query);
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