const axios = require("axios");

export default function LogoutBtn( {logoutClicked, nextState, setUserState, setClicked, userState} ) {
    return (
        <>
            <button id="logoutBtn" hidden={false} onClick={async() => {
                console.log("ClickedLogoutButton => userState: " + userState);
                console.log("ClickedLogoutButton => logoutClicked: " + logoutClicked);
                await axios.post("http://localhost:8000/logout", {}, {withCredentials: true}).then((res) => {
                    console.log("res.data: " + res.data);
                    setClicked(1);
                    setUserState(1);
                    nextState(5);
            })}}>Sign Out</button>
        </>
    )
}