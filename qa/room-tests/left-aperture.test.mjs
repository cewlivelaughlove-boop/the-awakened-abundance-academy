import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const source=await readFile(new URL('../rendered/assets/voidwalk-exterior-motion.js',import.meta.url),'utf8');
const {LEFT_WINDOW_POINTS:points,LEFT_WINDOW_PATH:path,EXTERIOR_MASK:svg}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
function inside(x,y){let on=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [xi,yi]=points[i],[xj,yj]=points[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)on=!on;}return on;}
for(const [x,y] of [[180,245],[220,280],[180,360],[210,410],[240,430]])assert(inside(x,y),`expected exterior ${x},${y}`);
for(const [x,y] of [[160,270],[164,330],[170,430],[170,225],[220,229],[245,245],[251,330],[245,444],[210,449],[245,465],[150,400]])assert(!inside(x,y),`protected architecture/foreground ${x},${y}`);
assert(svg.includes(`d="${path}"`));assert(source.includes('LEFT_WINDOW_POINTS.forEach'));assert.equal((source.match(/createElement\('video'\)/g)||[]).length,1);assert.equal((source.match(/ctx.drawImage/g)||[]).length,1);assert(!source.includes('setTimeout'));assert(!source.includes('ResizeObserver'));

console.log('PASS: left sky points open; arch/frame/sill/foreground points closed; same trace in SVG and raster mask; one native video, one artwork draw, no frame loop.');
