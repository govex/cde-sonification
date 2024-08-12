import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		paths: {
			base: process.env.NODE_ENV === 'production' ? '/sveltekit-gh-pages-spa-template' : ''
		},

		adapter: adapter({ fallback: '404.html' })
	}
};

export default config;
