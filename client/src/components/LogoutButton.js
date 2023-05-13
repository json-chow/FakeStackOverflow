export default function LogoutBtn( {nextState, userState} ) {
    return (
        <div id="menu main top">
            <button id="logoutBtn" hidden={false} onClick={() => {
                userState(1);
                nextState(5);
            }}>Sign Out</button>
        </div>
    )
}