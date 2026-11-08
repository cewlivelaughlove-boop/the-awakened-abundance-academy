import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {mountApparelComingSoon} from '../public/assets/apparel-coming-soon.js';
const dom=new JSDOM('<main id="boutique-scene"><div id="boutique-stage"><button class="point apparel" data-category="apparel">Apparel</button></div></main>',{url:'https://example.test/boutique.html'});
global.document=dom.window.document;global.ResizeObserver=class{observe(){}};
mountApparelComingSoon();
const link=document.querySelector('.boutique-shop-invitation');assert.equal(link.parentElement.id,'boutique-stage');assert.equal(link.getAttribute('href'),'./shop.html');assert.match(link.textContent,/Shop Apparel/);assert.match(document.querySelector('style').textContent,/top:79.5%/);assert.match(document.querySelector('style').textContent,/skewY\(-17deg\)/);assert.match(document.querySelector('style').textContent,/#boutique-stage .point.apparel\{display:none\}/);assert.equal(document.querySelectorAll('.boutique-shop-invitation').length,1);console.log('PASS: engraved shop label is attached to clothing-stage coordinates, with local coming-soon route and old floating hotspot removed.');dom.window.close();
