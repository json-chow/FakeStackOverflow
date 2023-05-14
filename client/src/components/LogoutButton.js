export default function LogoutBtn( {model, nextState, userState} ) {
    return (
        <>
            <button id="logoutBtn" hidden={false} onClick={() => {
                model.post("http://localhost:8000/logout");
                userState(1);
                nextState(5);
            }}>Sign Out</button>
        </>
    )
}