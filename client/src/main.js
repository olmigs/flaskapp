import App from './App.svelte';

const app = new App({
    target: document.body,
    props: {
        server: 'http://127.0.0.1:6980',
    },
});

export default app;
