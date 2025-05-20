import './App.css';
import React from "react";
import {Routes, Route} from 'react-router-dom';
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Home from "./pages/Home";

function App() {
    return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/" element={<Home />} />

            </Routes>
    );
}

export default App;
