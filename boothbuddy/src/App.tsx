import Home from "./pages/home.tsx"
import Login from "./pages/login.tsx"
import Download from "./pages/download.tsx"
import Booth from "./pages/photobooth.tsx"
import Signup from "./pages/signup.tsx"
import { HashRouter, Routes, Route } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/booth" element={<Booth />} />
        <Route path="/download" element={<Download />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </HashRouter>
  )
}

export default App
