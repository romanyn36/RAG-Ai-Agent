import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useState } from 'react'
import './App.css'
import Chat from './screens/chat/ChatPage'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  return (
    <main className="main-content">
      <ToastContainer position="top-center" autoClose={3000} />
      <Router>

        <Routes>
          <Route path="/" element={<Chat />} />
        </Routes>


      </Router>
    </main>
  )
}

export default App
