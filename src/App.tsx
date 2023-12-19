import {  createBrowserRouter,  RouterProvider } from 'react-router-dom'
import './App.css'
import Admin from './Admin';
import Home from './Home';

const router = createBrowserRouter([
    { path: '/', element: Home },
    { path: '/xumu', element: Admin },
])

function App() {
  return (
      <RouterProvider router={router} />
  )
}

export default App
