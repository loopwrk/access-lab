export function useRenderedHtml() {
  const renderedHtml = useState<string>('rendered-html', () => '')
  const renderedCss = useState<string>('rendered-css', () => '')

  function setOutput(html: string, css: string = '') {
    renderedHtml.value = html
    renderedCss.value = css
  }

  // Back-compat shim — callers that still pass a single string keep working.
  function setHtml(html: string) {
    setOutput(html, '')
  }

  return { renderedHtml, renderedCss, setHtml, setOutput }
}
