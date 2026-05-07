import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'claude-flow-kit',
  description: 'Production-ready Claude Code project template',
  lang: 'en-US',

  // Deployed to GitHub Pages at /claude-flow-kit/
  base: process.env.DOCS_BASE || '/claude-flow-kit/',

  cleanUrls: true,
  lastUpdated: true,
  // docs-site/sync-docs.mjs (run via prebuild) copies ../docs/*.md here
  // because Vite + symlinks misbehaves on rollup resolution.
  // Cross-doc links are validated by separate CI checks.
  ignoreDeadLinks: true,

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'claude-flow-kit',

    nav: [
      { text: 'Quick Start', link: '/quick-start' },
      { text: 'Architecture', link: '/architecture' },
      { text: 'Continuity', link: '/continuity' },
      {
        text: 'Reference',
        items: [
          { text: 'CLI Reference', link: '/cli-reference' },
          { text: 'Customization', link: '/customization' },
          { text: 'Adding Stacks', link: '/adding-stacks' },
        ],
      },
      { text: 'GitHub', link: 'https://github.com/DenisKondrachukYi/claude-flow-kit' },
      { text: 'npm', link: 'https://www.npmjs.com/package/claude-flow-kit' },
    ],

    sidebar: [
      {
        text: 'Getting started',
        items: [
          { text: 'Quick Start', link: '/quick-start' },
          { text: 'CLI Reference', link: '/cli-reference' },
        ],
      },
      {
        text: 'Concepts',
        items: [
          { text: 'Architecture', link: '/architecture' },
          { text: 'Session Continuity', link: '/continuity' },
        ],
      },
      {
        text: 'Customization',
        items: [
          { text: 'Customization Guide', link: '/customization' },
          { text: 'Adding a Stack', link: '/adding-stacks' },
        ],
      },
      {
        text: 'Project',
        items: [
          { text: 'v0.2 Plan', link: '/PLAN-v0.2' },
          { text: 'Security Policy', link: 'https://github.com/DenisKondrachukYi/claude-flow-kit/blob/main/SECURITY.md' },
          { text: 'Changelog', link: 'https://github.com/DenisKondrachukYi/claude-flow-kit/blob/main/CHANGELOG.md' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/DenisKondrachukYi/claude-flow-kit' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Denis Kondrachuk',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/DenisKondrachukYi/claude-flow-kit/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
});
