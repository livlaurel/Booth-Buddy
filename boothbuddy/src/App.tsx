import Home from "./pages/home.tsx"
import Login from "./pages/login.tsx"
import Download from "./pages/download.tsx"
import Booth from "./pages/photobooth.tsx"
import Signin from "./pages/signin.tsx"
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
        <Route path="/signin" element={<Signin />} />
      </Routes>
    </HashRouter>
  )
}

export default App
