import {defineConfig} from 'vite';
export default defineConfig({root:process.cwd(),base:'./',server:{host:'0.0.0.0',port:5173},optimizeDeps:{entries:['materials/trig-equation-unit-circle/index.html']}});
