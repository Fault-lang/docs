import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Fault',
  description: 'Building models in Fault',
  srcDir: '.',
  srcExclude: ['vendor/**', '_site/**', 'DOC_PLAN.md', 'README.md', 'TODO.txt'],

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Installation', link: '/installation/' },
      { text: 'Model Types', link: '/model-types/' },
      { text: 'Language Reference', link: '/language-reference/' },
      { text: 'Glossary', link: '/glossary/' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Home', link: '/' },
          { text: 'Installation', link: '/installation/' },
          { text: 'Solvers', link: '/installation/solvers' },
          { text: 'Configuration', link: '/installation/config' },
        ]
      },
      {
        text: 'Model Types',
        items: [
          { text: 'Overview', link: '/model-types/' },
          { text: 'Stock-Flow', link: '/model-types/stock-flow' },
          { text: 'Component State Machines', link: '/model-types/component-state-machines' },
          { text: 'Program Synthesis', link: '/model-types/program-synthesis' },
          { text: 'Boolean Logic', link: '/model-types/boolean-logic' },
        ]
      },
      {
        text: 'Language Reference',
        items: [
          { text: 'Overview', link: '/language-reference/' },
          { text: 'Fsystem and Fspec Files', link: '/language-reference/fsystem_fspec' },
          { text: 'Components', link: '/language-reference/components' },
          { text: 'States', link: '/language-reference/states' },
          { text: 'Stocks', link: '/language-reference/stocks' },
          { text: 'Flows', link: '/language-reference/flows' },
          { text: 'Functions', link: '/language-reference/functions' },
          { text: 'Time', link: '/language-reference/time' },
          { text: 'Special Syntax', link: '/language-reference/special_syntax' },
        ]
      },
      {
        text: 'Data Types',
        items: [
          { text: 'Data Types', link: '/data-types/' },
        ]
      },
      {
        text: 'Invariants',
        items: [
          { text: 'Overview', link: '/invariants/' },
          { text: 'Assertions', link: '/invariants/assertions' },
          { text: 'Assumptions', link: '/invariants/assumptions' },
        ]
      },
      {
        text: 'Glossary',
        items: [
          { text: 'All Keywords', link: '/glossary/' },
        ]
      },
      {
        text: 'LLM Prompts',
        items: [
          { text: 'Overview', link: '/prompts/' },
          { text: 'CLAUDE.md', link: '/prompts/CLAUDE' },
        ]
      },
    ],

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3]
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  }
})
