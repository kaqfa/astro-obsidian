import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import GithubSlugger from 'github-slugger';

import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';

function remarkWikilinks() {
  return (tree: any) => {
    visit(tree, 'text', (node, index, parent) => {
      const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
      const matches = [...node.value.matchAll(wikiLinkRegex)];
      
      if (matches.length === 0) return;

      const newNodes: any[] = [];
      let lastIndex = 0;

      matches.forEach((match) => {
        const [fullMatch, linkText] = match;
        const matchIndex = match.index!;

        if (matchIndex > lastIndex) {
          newNodes.push({
            type: 'text',
            value: node.value.slice(lastIndex, matchIndex)
          });
        }

        const [link, alias] = linkText.split('|');
        const displayText = alias || link;
        const href = `/notes/${link.trim()}`;

        newNodes.push({
          type: 'link',
          url: href,
          children: [{ type: 'text', value: displayText.trim() }]
        });

        lastIndex = matchIndex + fullMatch.length;
      });

      if (lastIndex < node.value.length) {
        newNodes.push({
          type: 'text',
          value: node.value.slice(lastIndex)
        });
      }

      parent.children.splice(index, 1, ...newNodes);
    });
  };
}

function remarkMermaid() {
  return (tree: any) => {
    visit(tree, 'code', (node) => {
      if (node.lang === 'mermaid') {
        node.type = 'html';
        node.value = `<pre class="mermaid">${node.value}</pre>`;
      }
    });
  };
}

function remarkExcalidraw() {
  return (tree: any) => {
    visit(tree, 'code', (node) => {
      if (node.lang === 'excalidraw') {
        node.type = 'html';
        node.value = `<div class="excalidraw-embed" data-excalidraw="${encodeURIComponent(node.value)}"></div>`;
      }
    });
  };
}


export async function processMarkdown(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkWikilinks)
    .use(remarkMermaid)
    .use(remarkExcalidraw)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(content);

  return String(result);
}

export function extractHeadings(content: string) {
  const slugger = new GithubSlugger();
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const depth = match[1].length;
    const text = match[2].trim();
    const slug = slugger.slug(text);
    headings.push({ depth, text, slug });
  }

  return headings;
}
