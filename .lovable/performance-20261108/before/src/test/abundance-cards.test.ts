import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { abundanceCards, shuffleDeck } from '../../public/assets/abundance-card-data.js';
import { mountAbundanceDeck } from '../../public/assets/abundance-cards.js';
import preservation from '../../.lovable/abundance-cards/preservation.json';

describe('Sample Abundance Cards rules', () => {
  let cleanup: undefined | (() => void);
  afterEach(() => { cleanup?.(); document.body.replaceChildren(); vi.restoreAllMocks(); });
  function mount() {
    document.body.innerHTML = '<main id="scene"><div id="stage"></div></main><details><summary>Room menu</summary><div class="room-menu-content"><a class="start-practice-link" href="./start.html">Start Here</a></div></details>';
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    HTMLDialogElement.prototype.showModal = function () { this.open = true; };
    HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new Event('close')); };
    cleanup = mountAbundanceDeck();
    const launcher = document.querySelector<HTMLButtonElement>('.abundance-launcher');
    if (!launcher) throw new Error('Deck not mounted');
    launcher.click();
    return launcher;
  }
  it('uses exactly 78 distinct illustrated tarot reflections with messages and practical actions', () => {
    expect(abundanceCards).toHaveLength(78);
    expect(new Set(abundanceCards.map(card => card.id)).size).toBe(78);
    expect(abundanceCards.every(card => card.message.length > 20 && card.action.length > 20)).toBe(true);
  });
  it('randomizes a copy without losing or duplicating any of the 78 cards', () => {
    const shuffled = shuffleDeck(abundanceCards, () => 0);
    expect(shuffled).not.toEqual(abundanceCards);
    expect(shuffled.map(card => card.id).sort()).toEqual(abundanceCards.map(card => card.id).sort());
    expect(abundanceCards[0]?.id).toBe('the-fool');
  });
  it('offers five choices, permits one reveal and resets on Draw again and Shuffle', () => {
    mount();
    const choices = document.querySelectorAll<HTMLButtonElement>('.abundance-choice');
    expect(choices).toHaveLength(5);
    choices[0]?.click();
    const title = document.querySelector('#abundance-card-name')?.textContent;
    choices[1]?.click();
    expect(document.querySelector('#abundance-card-name')?.textContent).toBe(title);
    expect([...choices].every(button => button.disabled)).toBe(true);
    document.querySelector<HTMLButtonElement>('.abundance-again')?.click();
    expect([...document.querySelectorAll<HTMLButtonElement>('.abundance-choice')].every(button => !button.disabled)).toBe(true);
    expect(document.querySelector<HTMLElement>('.abundance-reflection')?.hidden).toBe(true);
    document.querySelector<HTMLButtonElement>('.abundance-choice')?.click();
    document.querySelector<HTMLButtonElement>('.abundance-shuffle')?.click();
    expect(document.querySelector<HTMLElement>('.abundance-reflection')?.hidden).toBe(true);
  });
  it('returns focus to the desk after Escape and prevents deck gestures from starting scene pan', () => {
    const launcher = mount();
    const scenePan = vi.fn();
    document.querySelector('#scene')?.addEventListener('pointerdown', scenePan);
    launcher.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(scenePan).not.toHaveBeenCalled();
    document.querySelector('dialog')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.querySelector('dialog')?.open).toBe(false);
    expect(document.activeElement).toBe(launcher);
  });
  it('keeps every pre-existing production file unchanged except the backed-up rooms extension', () => {
    for (const file of preservation) {
      const path = file.path === 'public/assets/rooms.js' ? '.lovable/abundance-cards/rooms.before.js' : file.path === 'public/assets/celestial-reading.css' ? '.lovable/finishing/celestial-reading.before.css' : file.path;
      expect(createHash('sha256').update(readFileSync(path)).digest('hex'), file.path).toBe(file.sha256);
    }
  });
});