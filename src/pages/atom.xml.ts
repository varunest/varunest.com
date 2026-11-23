import { feedHtml } from "../lib/feed";
import { getPublishedPosts, legacyId, postUrl } from "../lib/posts";
import { SITE } from "../lib/site";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
const author = `<author><name>Varun Verma</name><uri>${SITE.url}</uri></author>`;

export async function GET() {
  const posts = (await getPublishedPosts()).slice(0, 20);
  const updated = (posts[0]?.data.date ?? new Date()).toISOString();
  const entries = (
    await Promise.all(
      posts.map(
        async (p) => `  <entry>
    <title>${esc(p.data.title)}</title>
    ${author}
    <link rel="alternate" type="text/html" href="${esc(SITE.url + postUrl(p.id))}"/>
    <id>${esc(legacyId(p))}</id>
    <updated>${p.data.date.toISOString()}</updated>
    <summary type="text">${esc(p.data.summary)}</summary>
    <content type="html">${cdata(await feedHtml(p))}</content>
  </entry>`,
      ),
    )
  ).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en-US">
  <title type="text">${esc(SITE.title)}</title>
  <subtitle type="text">Varun's portfolio, work and writing.</subtitle>
  <updated>${updated}</updated>
  <link rel="alternate" type="text/html" href="${SITE.url}"/>
  <id>https://varunest.com</id>
  <link rel="self" type="application/atom+xml" href="${SITE.url}/atom.xml"/>
  ${author}
${entries}
</feed>
`;
  return new Response(body, { headers: { "Content-Type": "application/atom+xml; charset=utf-8" } });
}
