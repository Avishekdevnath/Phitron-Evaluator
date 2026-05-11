export function readOutOf(modal: Element): number {
  const span = modal.querySelector<HTMLElement>('.font-weight-bold.pl-2')
  if (!span) return 100
  const val = parseInt(span.textContent ?? '', 10)
  return isNaN(val) ? 100 : val
}

export function fillMarkInput(modal: Element, value: number): void {
  const input = modal.querySelector<HTMLInputElement>('input[name="obtainMark"]')
  if (!input) return
  const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  if (nativeSetter) {
    nativeSetter.call(input, String(value))
  } else {
    input.value = String(value)
  }
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

export function fillQuillEditor(modal: Element, html: string): void {
  const qlContainer = modal.querySelector('.ql-container')
  const editor = modal.querySelector<HTMLElement>('.ql-editor')
  if (!editor) return

  // Strategy 1: Quill global API (preferred — keeps Quill internal state in sync)
  const quillGlobal = (window as any).Quill
  if (quillGlobal && qlContainer) {
    const quill = quillGlobal.find(qlContainer)
    if (quill) {
      quill.clipboard.dangerouslyPasteHTML(html)
      return
    }
  }

  // Strategy 2: Direct innerHTML fallback
  editor.innerHTML = html
}
