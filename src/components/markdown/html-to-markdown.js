import TurndownService from 'turndown';

import { htmlTags } from './html-tags';

const excludeTags = ['pre', 'code'];

const turndownService = new TurndownService({ codeBlockStyle: 'fenced', fence: '```' });

const filterTags = htmlTags.filter((item) => !excludeTags.includes(item));


turndownService.addRule('keep', {
  filter: filterTags,
  replacement(content, node) {
    const { isBlock, outerHTML } = node;

    return node && isBlock ? `\n\n${outerHTML}\n\n` : outerHTML;
  },
});



export function htmlToMarkdown(html) {
  return turndownService.turndown(html);
}


export function isMarkdownContent(content) {
  
  const markdownPatterns = [
    
    /^#+\s/,
    
    /^(\*|-|\d+\.)\s/,
    
    /^```/,
    
    /^\|/,
    
    /^(\s*)[*+-] [^\r\n]+/,
    
    /^(\s*)\d+\. [^\r\n]+/,
    
    /!\[.*?\]\(.*?\)/,
    
    /\[.*?\]\(.*?\)/,
  ];

  
  return markdownPatterns.some((pattern) => pattern.test(content));
}
