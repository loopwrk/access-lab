export function useInlineToClass() {
  function convert(html: string): string | null {
    const tagMatch = html.match(
      /<(\w+)\b([^>]*?)\s+style="([^"]*)"([^>]*?)>/
    )
    if (!tagMatch) return null

    const tagName = tagMatch[1] ?? ''
    const beforeStyle = tagMatch[2] ?? ''
    const styleStr = tagMatch[3] ?? ''
    const afterStyle = tagMatch[4] ?? ''

    const properties = styleStr
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => `  ${s};`)

    const className = 'custom-el'

    const cssBlock = [
      '<style>',
      `.${className} {`,
      ...properties,
      '}',
      '</style>'
    ].join('\n')

    const openTagAttrs = [beforeStyle.trim(), afterStyle.trim()]
      .filter(Boolean)
      .join(' ')

    const openTag = openTagAttrs
      ? `<${tagName} ${openTagAttrs} class="${className}">`
      : `<${tagName} class="${className}">`

    const newHtml = html.replace(
      /<(\w+)\b[^>]*?\s+style="[^"]*"[^>]*?>/,
      openTag
    )

    return `${newHtml}\n\n${cssBlock}`
  }

  return { convert }
}
