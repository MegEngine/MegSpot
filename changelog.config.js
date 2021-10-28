module.exports = {
  disableEmoji: false,
  list: ['feat', 'fix', 'combine', 'refactor', 'test', 'docs', 'chore', 'perf'],
  maxMessageLength: 64,
  minMessageLength: 3,
  questions: ['type', 'scope', 'subject', 'body', 'issues'],
  scopes: [],
  types: {
    chore: {
      description: 'Build process or auxiliary tool changes',
      emoji: '🤖',
      value: 'chore'
    },
    combine: {
      description: 'merge or rebase git branch',
      emoji: '🎡',
      value: 'combine'
    },
    docs: {
      description: 'Documentation only changes',
      emoji: '✏️',
      value: 'docs'
    },
    feat: {
      description: '新功能开发',
      emoji: '🎸',
      value: 'feat'
    },
    fix: {
      description: 'A bug fix',
      emoji: '🐛',
      value: 'fix'
    },
    test: {
      description: 'test',
      emoji: '⚡️',
      value: 'test'
    },
    perf: {
      description: 'A code change that improves performance',
      emoji: '⚡️',
      value: 'perf'
    },
    refactor: {
      description: 'A code change that neither fixes a bug or adds a feature',
      emoji: '💡',
      value: 'refactor'
    },
    release: {
      description: 'Create a release commit',
      emoji: '🏹',
      value: 'release'
    }
  }
};
