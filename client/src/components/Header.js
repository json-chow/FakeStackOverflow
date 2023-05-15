import LogoutBtn from "./LogoutButton";

export default function Header( {nextState, setUserState, userState, logoutClicked, setClicked, onQueryChange, showState} ) {
    return (
        <div id="header" className="header">
            {([0, 1, 2, 3, 4].includes(showState) && userState === 0) ? 
                  <LogoutBtn nextState = {nextState}
                  logoutClicked={logoutClicked}
                  userState={userState}
                  setClicked={setClicked}
                  setUserState={setUserState}/> : <div></div>}
            <span>Fake Stack Overflow</span>
            {[0, 1, 2, 3, 4].includes(showState) && 
              <input type="text"
                name="search"
                id="search"
                placeholder="Search ..."
                onKeyUp={(e) => {
                    if (e.key === "Enter")
                        onQueryChange(parseQuery(e.target.value));
                }}
              />
            }
        </div>
    )
}

function parseQuery(text) {
    let keywords = text.replaceAll(/\[\s*(\S*?)\s*\]/g, "").split(" ").filter(e => e !== "");
    let query = {
      nontags: [],
      tags: []
    }
    query.tags = Array.from(text.matchAll(/\[\s*(\S*?)\s*\]/g)).map((e) => e[1].toLowerCase());
    query.nontags = [];
    // Separate tags and nontags
    for (let i = 0; i < keywords.length; i++) {
      if (keywords[i][0] !== "[") {
        query.nontags.push(keywords[i].toLowerCase());
      }
    }
    return query
}