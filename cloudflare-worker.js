
export default {
    async fetch(request, env) {
        if (request.method === "OPTIONS") return withCors(new Response(null, { status: 204 }))
        const url = new URL(request.url)
        if (url.pathname === "/upload") return withCors(await handleUpload(request, env))
        if (url.pathname === "/sparql") return withCors(await handleSparql(request, env))
        if (url.pathname === "/download") return withCors(await handleDownload(request, env))
        return withCors(new Response("Not found", { status: 404 }))
    }
}

const VIRTUOSO_BASE_URL = "https://odd.bydata.de"
const ALLOWED_GRAPH_PREFIX = "https://open.bydata.de/oddmuc26#workshop_"

function withCors(response) {
    const headers = new Headers(response.headers)
    headers.set("Access-Control-Allow-Origin", "*")
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    headers.set("Access-Control-Allow-Headers", "Content-Type, Accept")
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    })
}

async function handleDownload(request, env) {
    if (request.method !== "GET") return new Response("Method not allowed", { status: 405 })

    const url = new URL(request.url)
    const graph = url.searchParams.get("graph")

    if (typeof graph !== "string" || !graph.startsWith(ALLOWED_GRAPH_PREFIX)) {
        return new Response("Graph name not allowed", { status: 400 })
    }

    const auth = btoa(`${env.VIRTUOSO_USER}:${env.VIRTUOSO_PASSWORD}`)
    const response = await fetch(
        `${VIRTUOSO_BASE_URL}/sparql-graph-crud?graph-uri=${encodeURIComponent(graph)}`,
        {
            method: "GET",
            headers: {
                Authorization: `Basic ${auth}`,
                Accept: "application/n-triples"
            }
        }
    )

    const text = await response.text()
    const filename = graph.split("#").pop() + ".nt"
    return new Response(text, {
        status: response.status,
        headers: {
            "Content-Type": response.headers.get("Content-Type") || "application/n-triples; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`
        }
    })
}

async function handleUpload(request, env) {
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 })

    const form = await request.formData()
    const file = form.get("file")
    const graph = form.get("graph")

    if (!(file instanceof File)) return new Response("Missing Turtle file", { status: 400 })

    if (typeof graph !== "string" || !graph.startsWith(ALLOWED_GRAPH_PREFIX)) {
        return new Response("Graph name not allowed", { status: 400 })
    }

    const auth = btoa(`${env.VIRTUOSO_USER}:${env.VIRTUOSO_PASSWORD}`)
    const turtle = await file.text()

    // appends if the graph exists, otherwise creates a new one
    const response = await fetch(
        `${VIRTUOSO_BASE_URL}/sparql-graph-crud?graph-uri=${encodeURIComponent(graph)}`,
        {
            method: "POST", // PUT would replace an existing graph, DELETE would delete it
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "text/turtle"
            },
            body: turtle
        }
    )

    const text = await response.text()
    return new Response(text || "OK", { status: response.status })
}

async function handleSparql(request, env) {
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 })

    const contentType = request.headers.get("content-type") || ""

    let query
    if (contentType.includes("application/json")) {
        ({ query } = await request.json())
    } else {
        const raw = await request.text()
        if (contentType.includes("application/x-www-form-urlencoded")) {
            const params = new URLSearchParams(raw)
            query = params.get("query")
        } else {
            query = raw
        }
    }

    if (typeof query !== "string" || !query.trim()) return new Response("Missing query", { status: 400 })

    query = query.trim()
    console.log("Query:", query)

    const blocked = ["DELETE", "DROP", "CLEAR", "LOAD", "CREATE", "COPY", "MOVE", "ADD"]
    const matched = blocked.find((keyword) => query.toUpperCase().includes(keyword))
    if (matched) return new Response(`Blocked SPARQL operation used: ${matched}`, { status: 403 })

    const auth = btoa(`${env.VIRTUOSO_USER}:${env.VIRTUOSO_PASSWORD}`)
    const response = await fetch(`${VIRTUOSO_BASE_URL}/sparql`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/sparql-query",
            Accept: "application/sparql-results+json, application/ld+json, text/turtle, text/plain"
        },
        body: query
    })

    const text = await response.text()
    return new Response(text, {
        status: response.status,
        headers: {
            "Content-Type": response.headers.get("Content-Type") || "text/plain; charset=utf-8"
        }
    })
}
