export function useRenderedHtml() {
  const renderedHtml = useState<string>('rendered-html', () => '')

  function setHtml(html: string) {
    renderedHtml.value = html
  }

  return { renderedHtml, setHtml }
}
