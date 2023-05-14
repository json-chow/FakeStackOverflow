import { useState } from 'react';
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
import LogoutBtn from './LogoutButton.js';

// var model = new Model();
const axios = require("axios");

export default function FakeStackOverflow() {
    const [query, setQuery] = useState({nontags: [], tags: [], sortBy: undefined});
    const [sideColor, setSideColor] = useState(0);
    const [notLoggedIn, setUserState] = useState(1);
    const [showState, setShowState] = useState(5);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [cookieState, setCookie] = useState({name: "", val: ""});
    const [firstTimeUser, setFirst] = useState({first: 1});

    return (
        <>
            <Header nextState={setShowState} userState={setUserState} notLoggedIn={notLoggedIn} onQueryChange={setQuery} showState={showState}/>
            <div id="main" className="main">
                {[0, 1, 2, 3, 4].includes(showState) && 
                    <Sidebar sideColor={sideColor}
                    setSideColor={setSideColor}
                    setQuery={setQuery}
                    nextState={setShowState}/>}
                {showState === 0 && 
                    <QuestionForum model={axios}
                        query={query}
                        setQuery={setQuery}
                        setSideColor={setSideColor}
                        nextState={setShowState}
                        notLoggedIn={notLoggedIn}
                        setCurrentQuestion={setCurrentQuestion}/>
                    }
                {showState === 1 && 
                    <AnswerForum model={axios}
                        currentQuestion={currentQuestion}
                        nextState={setShowState}
                        notLoggedIn={notLoggedIn}/>
                    }
                {showState === 2 &&
                    <AskQuestion model={axios}
                        setSideColor={setSideColor}
                        nextState={setShowState}
                        notLoggedIn={notLoggedIn}/>
                    }
                {showState === 3 && 
                    <PostAnswer model={axios}
                        qid={currentQuestion._id}
                        nextState={setShowState}
                        notLoggedIn={notLoggedIn}/>}
                {showState === 4 && 
                    <TagPage model={axios}
                        setSideColor={setSideColor}
                        setQuery={setQuery}
                        nextState={setShowState}
                        notLoggedIn={notLoggedIn}/>}
                {showState === 5 &&
                    <WelcomePage model={axios}
                        firstTimer={firstTimeUser}
                        setFirstTimer={setFirst}
                        cookie={cookieState}
                        nextState={setShowState}
                        setUserState={setUserState}
                        userState={notLoggedIn}/>}
                {showState === 6 &&
                    <CreateAccountPage model={axios}
                        nextState={setShowState}/>}
                {showState === 7 &&
                    <LoginPage model={axios}
                        setCookie={setCookie}
                        nextState={setShowState}
                        userState={setUserState}/>}
            </div>
        </>
    );
}
