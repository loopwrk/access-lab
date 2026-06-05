export function useRenderedHtml() {
  const renderedHtml = useState<string>("rendered-html", () => "");
  const renderedCss = useState<string>("rendered-css", () => "");
  const renderedJs = useState<string>("rendered-js", () => "");

  function setOutput(html: string, css: string = "", js: string = "") {
    renderedHtml.value = html;
    renderedCss.value = css;
    renderedJs.value = js;
  }

  return { renderedHtml, renderedCss, renderedJs, setOutput };
}
