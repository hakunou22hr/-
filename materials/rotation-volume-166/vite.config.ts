import {fileURLToPath} from 'node:url';
export default {root:fileURLToPath(new URL('.',import.meta.url)),base:'./',publicDir:false,build:{rollupOptions:{input:{main:fileURLToPath(new URL('./index.html',import.meta.url)),short:fileURLToPath(new URL('./short.html',import.meta.url))}},outDir:process.env.ROTATION_BUILD_DIR||'build',emptyOutDir:true},server:{host:'127.0.0.1'}};
