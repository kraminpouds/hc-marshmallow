import type { RouteObject } from "react-router-dom";
import Admin from './Admin';
import Home from './Home';
import Login from './Login';

const routes: RouteObject[] = [
    { path: '/', element: <Home /> },
    { path: '/xumu', element: <Admin /> },
    { path : '/xumu/login', element: <Login /> },
]

export default routes;