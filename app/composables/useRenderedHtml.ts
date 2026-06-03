export function useRenderedHtml() {
  const renderedHtml = useState<string>('rendered-html', () => '')
  const renderedCss = useState<string>('rendered-css', () => '')

  function setOutput(html: string, css: string = '') {
    renderedHtml.value = html
    renderedCss.value = css
  }

  return { renderedHtml, renderedCss, setOutput }
}
