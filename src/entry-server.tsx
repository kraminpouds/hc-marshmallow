import type * as express from "express";
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import {
    createStaticHandler,
    createStaticRouter,
    StaticRouterProvider,
} from "react-router-dom/server";
import routes from './routes';

export async function render(request: express.Request) {
    let { query, dataRoutes } = createStaticHandler(routes);
    let remixRequest = createFetchRequest(request);
    let context = await query(remixRequest);

    if (context instanceof Response) {
        throw context;
    }

    let router = createStaticRouter(dataRoutes, context);
    return renderToString(
        <StrictMode>
            <StaticRouterProvider
                router={router}
                context={context}
                nonce="the-nonce"
            />
        </StrictMode>
    );
}

export function createFetchRequest(req: express.Request): Request {
    let origin = `${req.protocol}://${req.get("host")}`;
    // Note: This had to take originalUrl into account for presumably vite's proxying
    let url = new URL(req.originalUrl || req.url, origin);

    let controller = new AbortController();
    req.on("close", () => controller.abort());

    let headers = new Headers();

    for (let [key, values] of Object.entries(req.headers)) {
        if (values) {
            if (Array.isArray(values)) {
                for (let value of values) {
                    headers.append(key, value);
                }
            } else {
                headers.set(key, values);
            }
        }
    }

    let init: RequestInit = {
        method: req.method,
        headers,
        signal: controller.signal,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
        init.body = req.body;
    }

    return new Request(url.href, init);
}