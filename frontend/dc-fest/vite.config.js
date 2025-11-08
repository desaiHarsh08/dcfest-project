import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, import.meta.dirname, 'VITE_');
    console.log("in vite config, env:", env);
    return {
        base: env.VITE_APP_NODE_ENV === "production" ? env.VITE_APP_PREFIX : "",
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(import.meta.dirname, './src'),
            },
        },
    };
});
