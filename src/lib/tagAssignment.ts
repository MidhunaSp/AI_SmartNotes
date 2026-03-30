export interface TagAssignment {
  name: string;
  color: string;
}

const tagPatterns = [
  {
    keywords: ['meeting', 'discussion', 'conference', 'standup', 'sync', 'call', 'zoom', 'teams'],
    tag: { name: 'Meeting', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  },
  {
    keywords: ['project', 'development', 'sprint', 'deadline', 'milestone', 'release', 'launch'],
    tag: { name: 'Project', color: 'bg-green-100 text-green-700 border-green-200' },
  },
  {
    keywords: ['action', 'todo', 'task', 'do', 'complete', 'finish', 'done', 'assign'],
    tag: { name: 'Action', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  },
  {
    keywords: ['important', 'urgent', 'critical', 'priority', 'asap', 'essential', 'must'],
    tag: { name: 'Important', color: 'bg-red-100 text-red-700 border-red-200' },
  },
  {
    keywords: ['idea', 'brainstorm', 'concept', 'proposal', 'suggestion', 'think', 'note'],
    tag: { name: 'Ideas', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  },
];

export function assignTagsFromContent(content: string, title: string = ''): TagAssignment[] {
  const text = (title + ' ' + content).toLowerCase();
  const words = text.split(/\W+/);
  const assignedTags = new Set<string>();

  for (const pattern of tagPatterns) {
    for (const keyword of pattern.keywords) {
      if (words.includes(keyword)) {
        assignedTags.add(pattern.tag.name);
        break;
      }
    }
  }

  if (assignedTags.size === 0) {
    assignedTags.add('General');
  }

  return Array.from(assignedTags).map((tagName) => {
    const pattern = tagPatterns.find((p) => p.tag.name === tagName);
    return pattern?.tag || { name: 'General', color: 'bg-gray-100 text-gray-700 border-gray-200' };
  });
}
