import CommentSection from "./CommentSection";
import Vote from "./Vote";

export default function Answer({model, answer, nextState, notLoggedIn}) {
    let aText = replaceHyperlinks(answer.text);
    return (
      <div className="acolumn">
          <div className="acolumn left">
              <Vote model={model} aid={answer._id} nextState={nextState}/>
          </div>

          <div className="acolumn mid">
              <p>{aText}</p>
              <br/>
              <CommentSection model={model} aid={answer._id} nextState={nextState} notLoggedIn={notLoggedIn}/>
          </div>

          <div className="acolumn right">
              <p className="author">{answer.ans_by}</p>
              <p className="dateAsked">{getTimeString(answer.ans_date_time, "answered")}</p>
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

function getTimeString(time, type) {
    time = new Date(time);
    var dateDiff = Date.now() - time;
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
    let dateString;
    if (dateDiff < 60 * 1000) {
      dateString = " " + type + " " + Math.trunc(dateDiff / 1000) + " seconds ago";
    } else if (dateDiff < 60 * 60 * 1000) {
      dateString = " " + type + " " + Math.trunc(dateDiff / (60 * 1000)) + " minutes ago"
    } else if (dateDiff < 24 * 60 * 60 * 1000) {
      dateString = " " + type + " " + Math.trunc(dateDiff / (60 * 60 * 1000)) + " hours ago"
    } else if (dateDiff < 365 * 24 * 60 * 60 * 1000) {
      dateString = " " + type + " " + months.get(time.getMonth()) + " " + time.getDate()
      + " at " + time.getHours() + ":" + min;
    } else {
      dateString = " " + type + " " + months.get(time.getMonth()) + " " + time.getDate() + ", " + time.getFullYear()
      + " at " + time.getHours() + ":" + min;
    }
    return dateString;
}