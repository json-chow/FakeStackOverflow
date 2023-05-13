export default function Sidebar( {sideColor, setSideColor, setQuery, setSortBy, nextState} ) {
    return (
        <>
            <div className="menu left">
                <br />
                <button id="questions"
                    style={{backgroundColor: `${sideColor === 1 || sideColor === -1 ? "white" : "lightgray"}`}}
                    onClick={() => {
                        setSideColor(0);
                        nextState(0);
                        setQuery({nontags:[], tags:[]});
                    }}>
                    Questions
                </button>
                <div style={{"lineHeight": "200%"}}>
                    <br />
                </div>
                <button id="tags"
                    style={{backgroundColor: `${sideColor === 1 ? "lightgray" : "white"}`}}
                    onClick={() => {
                        setSideColor(1);
                        nextState(4);
                    }}>
                    Tags
                </button>
            </div>
        </>
    )
}