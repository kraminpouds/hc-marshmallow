import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from './App';

export function render({ path }) {
    return renderToString(
        <StrictMode>
            <StaticRouter location={path}>
                <App  />
            </StaticRouter>
        </StrictMode>,
    );
}