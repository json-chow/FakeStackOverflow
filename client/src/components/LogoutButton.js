const axios = require("axios");

export default function LogoutBtn( {nextState, userState} ) {
    return (
        <>
            <button id="logoutBtn" hidden={false} onClick={async() => {
                await axios.post("http://localhost:8000/logout", {}, {withCredentials: true}).then((res) => {
                    console.log("res.data: " + res.data);
                    userState(1);
                    nextState(5);
            })}}>Sign Out</button>
        </>
    )
}