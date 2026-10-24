// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Muya } from '../../muya';

let muya: Muya;

beforeEach(() => {
    window.MUYA_VERSION = 'test';
    vi.useFakeTimers();
    const host = document.createElement('div');
    document.body.appendChild(host);
    muya = new Muya(host, { markdown: 'first\n\nsecond\n' });
    muya.init();
});

afterEach(() => {
    muya.destroy();
    muya.domNode.remove();
    vi.clearAllTimers();
    vi.useRealTimers();
    document.getSelection()?.removeAllRanges();
});

describe('first undo after load', () => {
    it('restores the caret recorded before the first edit', () => {
        const second = muya.editor.scrollPage!.lastContentInDescendant()!;
        muya.editor.activeContentBlock = second;
        second.setCursor(5, 5, true);
        second.text = 'seconXd';
        muya.flush();
        second.setCursor(6, 6, true);

        muya.undo();

        expect(muya.getMarkdown().trim()).toBe('first\n\nsecond');
        const selection = muya.editor.selection.getSelection();
        expect(selection?.anchor.offset).toBe(5);
        expect(selection?.focus.offset).toBe(5);
    });

    it('keeps a selection passed to cutoff over later caret moves', () => {
        const second = muya.editor.scrollPage!.lastContentInDescendant()!;
        muya.editor.activeContentBlock = second;
        second.setCursor(2, 2, true);
        const pinned = muya.editor.selection.getSelection()!;
        muya.editor.history.cutoff(pinned);
        second.setCursor(6, 6, true);
        second.text = 'seconXd';
        muya.flush();

        muya.undo();

        expect(muya.editor.selection.getSelection()?.anchor.offset).toBe(2);
    });
});
