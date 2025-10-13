import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignupPage from "./pages/SignupPage/SignupPage";
import Download from "./pages/download.tsx"
import Booth from "./pages/photobooth.tsx"
import Profile from "./pages/proflie.tsx"
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/booth" element={<Booth />} />
        <Route path="/download" element={<Download />} />
        <Route path="/profile" element={<Profile/>}/>
      </Routes>
    </Router>
  );

}

export default App;