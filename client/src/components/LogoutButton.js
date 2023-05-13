export default function LogoutBtn( {nextState, userState} ) {
    return (
        <>
            <button id="logoutBtn" hidden={false} onClick={() => {
                userState(1);
                nextState(5);
            }}>Sign Out</button>
        </>
    )
}