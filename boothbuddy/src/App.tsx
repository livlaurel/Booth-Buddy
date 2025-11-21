import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignupPage from "./pages/SignupPage/SignupPage";
import EditProfilePage from "./pages/EditProfilePage/EditProfilePage";
import Download from "./pages/download.tsx"
import Booth from "./pages/photobooth.tsx"
import Profile from "./pages/proflie.tsx"
import Gallery from "./components/Gallery"
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
        <Route path="/gallery" element={<Gallery/>}/>
         <Route path="/edit-profile" element={<EditProfilePage />} />
      </Routes>
    </Router>
  );

}

export default App;