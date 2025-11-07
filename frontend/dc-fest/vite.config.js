// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    console.log("in vite config, env:", env);
    // Use base path from env for both dev and production (to test production setup)
    const basePath = env.VITE_APP_PREFIX || '/umang';
    console.log("Using base path:", basePath, "for mode:", mode);
    return {
        base: basePath, // ✅ Base URL for assets
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        preview: {
            port: 3007,
            strictPort: true,
        },
    };
});
