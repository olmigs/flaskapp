import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		u1_label: "Upper 1",
		u2_label: "Upper 2",
		l_label: "Lower",
		server: "http://localhost:5000"
	}
});

export default app;