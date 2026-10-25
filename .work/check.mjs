const routes = ["/", "/services/iam-development", "/technologies/keycloak", "/contact", "/about", "/privacy"];
for (const route of routes) {
 const response = await fetch(`http://localhost:3100${route}`);
 const html = await response.text();
 console.log(JSON.stringify({route,status:response.status,bytes:Buffer.byteLength(html),cache:response.headers.get('cache-control'),title:html.match(/<title>(.*?)<\/title>/)?.[1],h1:html.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1],scope:html.includes('What the engagement includes.')}));
}
