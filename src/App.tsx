import { Routes, Route } from "react-router-dom";
import Admin from './Admin';
import Home from './Home';
import Login from './Login';

function App() {
  return (
      <Routes>
          <Route index element={<Home />} />
          <Route path="/xumu" element={<Admin />} />
          <Route path="/xumu/login" element={<Login />} />
          <Route path="*" element={<Home />} />
      </Routes>
  )
}

export default App
