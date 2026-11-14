import { parseInlineMarkdown } from '../content.js'

export default function InlineMarkdown({ children }) {
  return parseInlineMarkdown(children).map((part, index) => {
    if (part.type === 'strong') return <strong key={index}>{part.text}</strong>
    if (part.type === 'image') {
      return <img className="about-markdown-image" key={index} src={part.url} alt={part.alt} loading="lazy" decoding="async" />
    }
    return part.text
  })
}
