import { defineConfig } from 'vite'

const repo = process.env.GITHUB_REPOSITORY;

export default defineConfig({
  base: repo ? '/'+repo.split('/')[1] : '/'
});