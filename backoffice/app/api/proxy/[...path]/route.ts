import { NextRequest } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const BACKEND_GATE_AUTHORIZATION =
  process.env.NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION ?? "Basic CHANGE_ME";

function buildTargetUrl(request: NextRequest, path: string[]) {
  const target = new URL(`${API_BASE}/${path.join("/")}`);
  target.search = new URL(request.url).search;
  return target;
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = buildTargetUrl(request, path);
  const headers = new Headers(request.headers);

  headers.set("X-Gate-Authorization", BACKEND_GATE_AUTHORIZATION);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("origin");
  headers.delete("expect");

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
    redirect: "manual",
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }

  const upstream = await fetch(target, init);
  const responseHeaders = new Headers();
  const contentType = upstream.headers.get("content-type");

  if (contentType) {
    responseHeaders.set("content-type", contentType);
  }

  const location = upstream.headers.get("location");
  if (location) {
    responseHeaders.set("location", location);
  }

  return new Response(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
