import App from './App.svelte';

const app = new App({
    target: document.body,
    props: {
        server: 'http://0.0.0.0:6980',
    },
});

export default app;
