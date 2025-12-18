import { visit } from 'unist-util-visit';
import { h } from 'hastscript';

/**
 * Rehype plugin to add copy button to code blocks
 * Wraps <pre> elements in a container and injects a copy button
 */
export function rehypeCopyButton() {
  return (tree: any) => {
    visit(tree, 'element', (node, index, parent) => {
      // Target <pre> elements that contain code
      if (node.tagName === 'pre' && parent && typeof index === 'number') {
        // Extract code content
        const codeNode = node.children?.find((child: any) => child.tagName === 'code');
        if (!codeNode) return;

        // Get text content from code node
        const getTextContent = (node: any): string => {
          if (node.type === 'text') return node.value;
          if (node.children) {
            return node.children.map(getTextContent).join('');
          }
          return '';
        };

        const codeText = getTextContent(codeNode);
        
        // Create wrapper div with relative positioning
        const wrapper = h('div', { class: 'code-block-wrapper' }, [
          // Copy button (will be hydrated by React)
          h('button', {
            class: 'copy-code-btn',
            'data-code': codeText,
            'aria-label': 'Copy code to clipboard',
            title: 'Copy code'
          }, [
            h('span', { class: 'copy-icon' }, '📋')
          ]),
          // Original pre element
          node
        ]);

        // Replace pre with wrapper
        parent.children[index] = wrapper;
      }
    });
  };
}
