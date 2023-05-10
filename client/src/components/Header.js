export default function Header( {onQueryChange} ) {
    return (
        <div id="header" className="header">
            <h1>Fake Stack Overflow</h1>
            <input 
                type="text"
                name="search"
                id="search"
                placeholder="Search ..."
                onKeyUp={(e) => {
                    if (e.key === "Enter")
                        onQueryChange(parseQuery(e.target.value));
                }}
            />
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