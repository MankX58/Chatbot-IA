import './App.css'
import { Auth0Provider } from '@auth0/auth0-react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { auth0Config } from '../config/auth0Config'
import LoginHeader from './components/login/Header'
import LoginMain from './components/login/Main'
import ChatMain from './components/chat_response/App'

function App() {
  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: auth0Config.redirectUri,
        audience: `https://${auth0Config.domain}/api/v2/`,
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<><LoginHeader /><LoginMain /></>}/>
          <Route path="/home" element={<><ChatMain /></>}/>
        </Routes>
      </Router>
    </Auth0Provider>
  )
}

export default App