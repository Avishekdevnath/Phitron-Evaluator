// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readOutOf, fillMarkInput, fillQuillEditor } from './phitronFormFiller'

function buildModal(outOfValue: string, inputValue = '0') {
  const modal = document.createElement('div')
  modal.innerHTML = `
    <div class="assignment-evaluation-form">
      <input name="obtainMark" type="number" value="${inputValue}" />
      <span class="font-weight-bold pl-2">${outOfValue}</span>
      <div class="ql-container">
        <div class="ql-editor" contenteditable="true"><p></p></div>
      </div>
    </div>
  `
  return modal
}

describe('readOutOf', () => {
  it('reads numeric value from out-of span', () => {
    expect(readOutOf(buildModal('90'))).toBe(90)
  })

  it('returns 100 when span not found', () => {
    expect(readOutOf(document.createElement('div'))).toBe(100)
  })

  it('returns 100 when span contains non-numeric text', () => {
    expect(readOutOf(buildModal('N/A'))).toBe(100)
  })
})

describe('fillMarkInput', () => {
  it('dispatches input and change events after setting value', () => {
    const modal = buildModal('100', '0')
    const input = modal.querySelector('input[name="obtainMark"]') as HTMLInputElement
    const inputSpy = vi.fn()
    const changeSpy = vi.fn()
    input.addEventListener('input', inputSpy)
    input.addEventListener('change', changeSpy)

    fillMarkInput(modal, 76)

    expect(inputSpy).toHaveBeenCalledTimes(1)
    expect(changeSpy).toHaveBeenCalledTimes(1)
  })

  it('does not throw when input not found', () => {
    expect(() => fillMarkInput(document.createElement('div'), 76)).not.toThrow()
  })
})

describe('fillQuillEditor', () => {
  beforeEach(() => {
    ;(window as any).Quill = undefined
  })

  it('sets ql-editor innerHTML when no Quill global', () => {
    const modal = buildModal('100')
    fillQuillEditor(modal, '<p>Hello</p>')
    const editor = modal.querySelector('.ql-editor') as HTMLElement
    expect(editor.innerHTML).toContain('Hello')
  })

  it('uses Quill global when available', () => {
    const modal = buildModal('100')
    const qlContainer = modal.querySelector('.ql-container')
    const mockQuill = { clipboard: { dangerouslyPasteHTML: vi.fn() } }
    ;(window as any).Quill = { find: vi.fn().mockReturnValue(mockQuill) }

    fillQuillEditor(modal, '<p>Test</p>')

    expect((window as any).Quill.find).toHaveBeenCalledWith(qlContainer)
    expect(mockQuill.clipboard.dangerouslyPasteHTML).toHaveBeenCalledWith('<p>Test</p>')
  })

  it('does not throw when ql-editor not found', () => {
    expect(() => fillQuillEditor(document.createElement('div'), '<p>Test</p>')).not.toThrow()
  })
})
