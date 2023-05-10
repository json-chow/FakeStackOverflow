import { useState } from 'react';
// import Model from '../models/model.js';
import Header from './Header.js';
import QuestionForum from './QuestionForum.js';
import AnswerForum from './AnswerForum.js';
import Sidebar from './Sidebar.js';
import TagPage from './TagPage.js';
import AskQuestion from './AskQuestion.js';
import PostAnswer from './PostAnswer.js';
import WelcomePage from './WelcomePage.js';
import CreateAccountPage from './CreateAccountPage.js';
import LoginPage from './LoginPage.js';
import Guest from './Guest.js';

// var model = new Model();
const axios = require("axios");

export default function FakeStackOverflow() {
    const [query, setQuery] = useState({nontags: [], tags: []});
    const [sideColor, setSideColor] = useState(0);
    const [sortBy, setSortBy] = useState("");

    const [showState, setShowState] = useState(5);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [userState, setUserState] = useState(0);


    /*
    <Sidebar sideColor={sideColor} // goes after <Header onQueryChange={setQuery}/> <div id="main" className="main">
                    setSideColor={setSideColor}
                    setQuery={setQuery}
                    setSortBy={setSortBy}
                    nextState={setShowState}/>
    */
        <div className="menu main">
            <h2>Welcome to the greatest webthingy of all time.</h2>
            <button id="register" onClick={() => {
                setUserState("Registered");
            }}>
                Register
            </button>
            <button id="login" onClick={() => {
                setUserState(7);
            }}>
                Returning User
            </button>
            <button id="guest" onClick={() => {
                setUserState(8);
            }}>
                Continue as Guest
            </button>
        </div>

    return (
        <>
            <Header onQueryChange={setQuery}/>
            <div id="main" className="main">

                {showState === 0 && 
                    <QuestionForum model={axios}
                        query={query}
                        setQuery={setQuery}
                        setSideColor={setSideColor}
                        sortBy={sortBy}
                        setSortBy={setSortBy}

                        nextState={setShowState}
                        setCurrentQuestion={setCurrentQuestion}/>
                    }
                {showState === 1 && 
                    <AnswerForum model={axios}
                        currentQuestion={currentQuestion}
                        nextState={setShowState}/>
                    }
                {showState === 2 &&
                    <AskQuestion model={axios}
                        setSideColor={setSideColor}
                        nextState={setShowState}/>
                    }
                {showState === 3 && 
                    <PostAnswer model={axios}
                        qid={currentQuestion._id}
                        nextState={setShowState}/>}
                {showState === 4 && 
                    <TagPage model={axios}
                        setSideColor={setSideColor}
                        setQuery={setQuery}
                        setSortBy={setSortBy}
                        nextState={setShowState}/>}
                {showState === 5 &&
                    <WelcomePage model={axios}
                        nextState={setShowState}/>}
                {showState === 6 &&
                    <CreateAccountPage model={axios}
                        nextState={setShowState}/>}
                {showState === 7 &&
                    <LoginPage model={axios}
                        nextState={setShowState}/>}
                {showState === 8 &&
                    <Guest model={axios}
                        nextState={setShowState}/>}
            </div>
        </>
    );
}
