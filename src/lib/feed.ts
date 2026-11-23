import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { render } from "astro:content";
import { SITE } from "./site";
import type { Post } from "./posts";

let container: Promise<AstroContainer> | undefined;

/** Fully rendered post HTML (images resolved) with root-relative URLs made absolute, for feed readers. */
export async function feedHtml(post: Post): Promise<string> {
  container ??= AstroContainer.create();
  const { Content } = await render(post);
  const html = await (await container).renderToString(Content);
  return html.replace(/(\s(?:src|href)=")\/(?!\/)/g, `$1${SITE.url}/`);
}
