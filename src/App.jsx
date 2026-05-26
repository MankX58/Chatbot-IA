import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginHeader from './components/login/Header';
import LoginMain from './components/login/Main';
import ChatMain from './components/chat_response/App';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<><LoginHeader /><LoginMain /></>} />
        <Route
          path="/home"
          element={(
            <ProtectedRoute>
              <ChatMain />
            </ProtectedRoute>
          )}
        />
      </Routes>
    </Router>
  );
}

export default App;
