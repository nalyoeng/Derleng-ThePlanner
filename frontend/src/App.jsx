import './App.css'
import Header from './components/Header'
import FirstCard from './components/FirstCard'
import ChatPage from './components/chatting/Chatpage'
// 1. Swap 'Router' out, and import 'Routes' and 'Route' correctly
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div>
      <ChatPage/>
    </div>
  )
}

export default App