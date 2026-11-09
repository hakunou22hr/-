import {fileURLToPath} from 'node:url';
export default {root:fileURLToPath(new URL('.',import.meta.url)),base:'./',publicDir:false,build:{outDir:process.env.ROTATION_BUILD_DIR||'build',emptyOutDir:true},server:{host:'127.0.0.1'}};
