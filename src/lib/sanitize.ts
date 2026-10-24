import sanitizeHtml from "sanitize-html";
export function cleanHtml(html: string) {
  return sanitizeHtml(html, { allowedTags: ["p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "em", "blockquote", "code", "pre", "a", "br", "hr"], allowedAttributes: { a: ["href", "title"] }, allowedSchemes: ["https", "mailto"], allowProtocolRelative: false });
}
