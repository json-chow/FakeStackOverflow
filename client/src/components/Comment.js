import Vote from "./Vote";

export default function Comment( {model, comment} ){
    return (
        <div className="cmnt">
            <div className="cmnt left">
                <Vote model={model} cid={comment._id}/>
            </div>
            <div className="cmnt right">
                {replaceHyperlinks(comment.text)}
                <span>{" - "}</span> 
                <span className="cmntby">{comment.cmnt_by}</span>
                <span className="cmnttime">{getTimeString(comment.cmnt_date_time)}</span>
            </div>
        </div>
    )
}

function replaceHyperlinks(text) {
  let re = /\[([^\]]*?)\]\((.*?)\)/g;
  let matches = [...text.matchAll(re)];
  let newTextArr = [];
  let ind = 0;
  for (let i=0; i<matches.length; i++) {
      let match = matches[i][0];
      let atext = matches[i][1];
      let url = matches[i][2];
      let sind = matches[i].index;
      let eind = matches[i].index + match.length;
      newTextArr.push(text.slice(ind, sind));
      newTextArr.push(<a href={url}>{atext}</a>);
      ind = eind;
  }
  newTextArr.push(text.slice(ind, text.length));
  return newTextArr;
}

function getTimeString(time) {
    time = new Date(time);
    var dateDiff = Date.now() - time;
    let dateString;
    const months = new Map([
        [0, "Jan"],
        [1, "Feb"],
        [2, "Mar"],
        [3, "Apr"],
        [4, "May"],
        [5, "Jun"],
        [6, "Jul"],
        [7, "Aug"],
        [8, "Sep"],
        [9, "Oct"],
        [10, "Nov"],
        [11, "Dec"],
      ]);
    let min = time.getMinutes();
    if (min < 10) {
    min = "0" + min;
    }
    if (dateDiff < 60 * 1000) {
      dateString = " " + Math.trunc(dateDiff / 1000) + " seconds ago";
    } else if (dateDiff < 60 * 60 * 1000) {
      dateString = " " + Math.trunc(dateDiff / (60 * 1000)) + " minutes ago"
    } else if (dateDiff < 24 * 60 * 60 * 1000) {
      dateString = " " + Math.trunc(dateDiff / (60 * 60 * 1000)) + " hours ago"
    } else if (dateDiff < 365 * 24 * 60 * 60 * 1000) {
      dateString = " " + months.get(time.getMonth()) + " " + time.getDate()
      + " at " + time.getHours() + ":" + min;
    } else {
      dateString = " " + months.get(time.getMonth()) + " " + time.getDate() + ", " + time.getFullYear()
      + " at " + time.getHours() + ":" + min;
    }
    return dateString;
}