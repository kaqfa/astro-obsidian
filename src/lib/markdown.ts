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
import { getFilePathCache } from './vault';
import { parse } from 'path';
import { rehypeCopyButton } from './rehype-copy-button';

// ============================================
// MARKDOWN PROCESSING CACHE (LRU)
// ============================================

interface CacheEntry {
  html: string;
  timestamp: number;
}

const markdownCache = new Map<string, CacheEntry>();
const MAX_CACHE_SIZE = 500; // Keep last 500 processed notes (increased from 50)
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes (increased from 5 minutes)

/**
 * Invalidate markdown cache for a specific slug or all
 */
export function invalidateMarkdownCache(slug?: string): void {
  if (slug) {
    markdownCache.delete(slug);
    console.log(`[Cache] Invalidated markdown cache for: ${slug}`);
  } else {
    markdownCache.clear();
    console.log('[Cache] Cleared all markdown cache');
  }
}

/**
 * LRU eviction: remove oldest entry when cache is full
 */
function evictOldestEntry(): void {
  const firstKey = markdownCache.keys().next().value;
  if (firstKey) {
    markdownCache.delete(firstKey);
  }
}

function remarkWikilinks() {
  return (tree: any) => {
    const cache = getFilePathCache();
    
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
        
        // Resolve path using cache
        let href: string;
        let cssClass = '';
        
        if (cache) {
          // Try multiple resolution strategies:
          let resolvedPath: string | undefined;
          
          const linkTrimmed = link.trim();
          const linkLower = linkTrimmed.toLowerCase();
          
          // Strategy 1: Try exact match (for paths like "Weekly/2025/W51-Plan")
          resolvedPath = cache.get(linkLower);
          
          // Strategy 2: Try basename only (for simple links like "W51-Plan")
          if (!resolvedPath) {
            const basename = parse(linkTrimmed).name;
            resolvedPath = cache.get(basename.toLowerCase());
          }
          
          // Strategy 3: Try with .md extension removed
          if (!resolvedPath && linkTrimmed.endsWith('.md')) {
            const withoutExt = linkTrimmed.slice(0, -3);
            resolvedPath = cache.get(withoutExt.toLowerCase());
          }
          
          if (resolvedPath) {
            // Found! Use resolved path
            href = `/notes/${resolvedPath}`;
          } else {
            // Broken link - keep original but mark as broken
            href = `/notes/${linkTrimmed}`;
            cssClass = 'broken-wikilink';
          }
        } else {
          // Fallback to original behavior jika cache belum ready
          href = `/notes/${link.trim()}`;
        }

        newNodes.push({
          type: 'link',
          url: href,
          children: [{ type: 'text', value: displayText.trim() }],
          data: {
            hProperties: {
              class: cssClass || undefined
            }
          }
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


export async function processMarkdown(content: string, slug?: string): Promise<string> {
  // Generate cache key (use slug if provided, otherwise hash content)
  const cacheKey = slug || content.substring(0, 100); // Simple key for now
  
  // Check cache
  const cached = markdownCache.get(cacheKey);
  if (cached) {
    const age = Date.now() - cached.timestamp;
    if (age < CACHE_TTL) {
      return cached.html;
    } else {
      // TTL expired, remove stale entry
      markdownCache.delete(cacheKey);
    }
  }
  
  // Process markdown (cache miss or expired)
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
    .use(rehypeCopyButton)
    .use(rehypeStringify)
    .process(content);

  const html = String(result);
  
  // Store in cache with LRU eviction
  if (markdownCache.size >= MAX_CACHE_SIZE) {
    evictOldestEntry();
  }
  
  markdownCache.set(cacheKey, {
    html,
    timestamp: Date.now()
  });

  return html;
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
