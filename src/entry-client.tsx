import './index.css'
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import {
    createBrowserRouter,
    matchRoutes,
    RouterProvider,
} from "react-router-dom";
import routes from './routes';

async function hydrate() {
    // Determine if any of the initial routes are lazy
    let lazyMatches = matchRoutes(routes, window.location)?.filter(
        (m) => m.route.lazy
    );

    // Load the lazy matches and update the routes before creating your router
    // so we can hydrate the SSR-rendered content synchronously
    if (lazyMatches && lazyMatches?.length > 0) {
        await Promise.all(
            lazyMatches.map(async (m) => {
                let routeModule = await m.route.lazy!();
                Object.assign(m.route, { ...routeModule, lazy: undefined });
            })
        );
    }

    const router = createBrowserRouter(routes);
    const container = document.getElementById("root");
    const App = () => (
        <StrictMode>
            <RouterProvider router={router} fallbackElement={null} />
        </StrictMode>
    )


    if (import.meta.hot || !container?.innerText) {
        const root = createRoot(container!);
        root.render(<App />);
    } else {
        hydrateRoot(container!, <App />);
    }
}

await hydrate();
