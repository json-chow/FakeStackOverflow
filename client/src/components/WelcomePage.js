import { useState } from "react";

export default function WelcomePage( {model, nextState} ) {
    return (
        <div className="menu main">
            <h2>Welcome to the greatest webthingy of all time.</h2>
            <button id="register" onClick={() => {
                nextState(6);
            }}>
                Register
            </button>
            <button id="login" onClick={() => {
                nextState(7);
            }}>
                Returning User
            </button>
            <button id="guest" onClick={() => {
                nextState(8);
            }}>
                Continue as Guest
            </button>
        </div>
    )
}