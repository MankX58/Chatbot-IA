import './App.css'
import LoginHeader from './components/login/Header'
import LoginMain from './components/login/Main'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<><LoginHeader /><LoginMain /></>}/>
        <Route path="/home" element={<><h1>Home</h1></>} />
      </Routes>
    </Router>
  )
}

export default App