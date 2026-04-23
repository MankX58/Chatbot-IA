import './App.css'
// import ChatMain from './components/chat_response/Main'
import LoginHeader from './components/login/Header'
import LoginMain from './components/login/Main'
import ChatMain from './components/chat_response/App'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<><LoginHeader /><LoginMain /></>}/>
        <Route path="/home" element={<><ChatMain /></>}/>
      </Routes>
    </Router>
  )
}

export default App