import { ConfigProvider } from 'antd';
import { Routes, Route } from "react-router-dom";
import Admin from './Admin';
import Home from './Home';
import Login from './Login';

function App() {
  return (
      <ConfigProvider theme={{ components: {
            Input: {
                colorTextDescription: 'white'
            }
          } }}>
          <Routes>
              <Route index element={<Home />} />
              <Route path="/xumu" element={<Admin />} />
              <Route path="/xumu/login" element={<Login />} />
              <Route path="*" element={<Home />} />
          </Routes>
      </ConfigProvider>
  )
}

export default App
