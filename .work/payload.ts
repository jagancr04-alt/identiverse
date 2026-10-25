import { pages as before } from './original-catalog';
import { pages as after } from '../src/lib/catalog';
console.log(JSON.stringify({metric:'navigation page-prop JSON bytes',before:Buffer.byteLength(JSON.stringify(before)),after:Buffer.byteLength(JSON.stringify(after.map(({slug,group,title})=>({slug,group,title}))))}));
