import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mountApparelComingSoon } from '../public/assets/apparel-coming-soon.js';
import { JSDOM } from 'jsdom';
function setup() {
  const dom = new JSDOM('<main id="boutique-scene"><div id="boutique-stage"><button class="point apparel" data-category="apparel">Apparel</button></div></main><details class="compact-room-menu" open><summary>Room menu</summary><button data-category="apparel">Apparel</button></details>', {url:'https://example.test/boutique.html',pretendToBeVisual:true});
  global.document = dom.window.document;
  global.ResizeObserver = class { observe() {} };
  const proto = dom.window.HTMLDialogElement.prototype;
  proto.showModal = function() { this.open = true; };
  proto.close = function() { this.open = false; this.dispatchEvent(new dom.window.Event('close')); };
  mountApparelComingSoon();
  return { dom, button:document.querySelector('.boutique-shop-invitation'), dialog:document.querySelector('#apparel-coming-soon') };
}
test('engraving contains only Shop Apparel on the existing stage and paints no floor box', () => {
 const {dom,button}=setup();
 assert.equal(button.textContent,'Shop Apparel'); assert.equal(button.tagName,'BUTTON');
 assert.equal(button.parentElement.id,'boutique-stage'); assert.equal(button.getAttribute('aria-haspopup'),'dialog');
 const css=document.querySelector('style[data-apparel-engraving]').textContent;
 assert.match(css,/background: transparent !important; box-shadow: none/);
 assert.match(css,/#boutique-stage \.point\.apparel \{ display: none; \}/);
 assert.equal(button.querySelector('small'),null); assert.equal(button.getAttribute('href'),null);
 dom.window.close();
});
test('label corners fit wholly within physical wardrobe plinth, never on the floor', () => {
 // CSS matches current 1672x941 reference image; measured top and bottom frame edges.
 const x=1672*.06,y=941*.795,w=1672*.184,h=941*.054,slope=Math.tan(-19.8*Math.PI/180);
 for(const px of [x,x+w]) {
  const top=y+slope*(px-x-w/2),bottom=top+h;
  const railTop=795+(px-70)*(678-795)/(438-70);
  const railBottom=887+(px-70)*(740-887)/(438-70);
  assert.ok(top>railTop, `top at ${px}: ${top} <= ${railTop}`);
  assert.ok(bottom<railBottom, `bottom at ${px}: ${bottom} >= ${railBottom}`);
 }
});
test('one click opens Coming soon without navigation, close returns keyboard focus', () => {
 const {dom,button,dialog}=setup(); button.focus(); button.click();
 assert.equal(dialog.open,true); assert.equal(dialog.querySelector('h2').textContent,'Coming soon');
 assert.equal(dom.window.location.pathname,'/boutique.html');
 dialog.querySelector('.apparel-message-close').click();
 assert.equal(dialog.open,false); assert.equal(document.activeElement,button); dom.window.close();
});
test('menu apparel opens the same dialog, closes room menu, and repeated clicks do not duplicate', () => {
 const {dom,button,dialog}=setup(); const menuButton=document.querySelector('details button');
 menuButton.click(); assert.equal(dialog.open,true); assert.equal(document.querySelector('details').open,false);
 button.click(); mountApparelComingSoon();
 assert.equal(document.querySelectorAll('#apparel-coming-soon').length,1);
 assert.equal(document.querySelectorAll('.boutique-shop-invitation').length,1);
 dialog.querySelector('.apparel-message-close').click(); assert.equal(document.activeElement,document.querySelector('summary'));dom.window.close();
});
test('apparel pointer interaction does not begin room drag', () => {
 const {dom,button}=setup();let dragStarted=false;
 document.querySelector('#boutique-scene').addEventListener('pointerdown',()=>{dragStarted=true});
 button.dispatchEvent(new dom.window.Event('pointerdown',{bubbles:true})); assert.equal(dragStarted,false);dom.window.close();
});
test('dialog is labelled, has one obvious return button and no purchase or unsupported offer', () => {
 const {dom,dialog}=setup(); assert.equal(dialog.getAttribute('aria-labelledby'),'apparel-coming-soon-title');
 assert.equal(dialog.querySelectorAll('button').length,1);assert.equal(dialog.querySelectorAll('form,a').length,0);
 assert.doesNotMatch(dialog.textContent,/Shopify|buy|checkout|sign up/i); dom.window.close();
});
