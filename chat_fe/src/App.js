import './App.css';
import React from "react";
import {Routes, Route, BrowserRouter} from 'react-router-dom';
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";

function App() {
    return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
            </Routes>
    );
}

export default App;
