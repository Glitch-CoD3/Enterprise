import { sitePath } from '../../../lib/sitePath.js'

export default function FeedSignInPrompt() {
  return (
    <div className="mb-[30px] flex flex-wrap items-center gap-3 rounded-xl border border-[#2b3730] bg-[#171d19] p-[15px]">
      <span className="text-[19px] text-[#9ab2ff]" aria-hidden="true">✳</span>
      <div className="flex-1 max-[480px]:basis-[calc(100%-34px)]">
        <strong className="text-sm">Have something to share?</strong>
        <p className="mb-0 mt-1 text-xs text-[#a9b5ac]">Have a question or idea? I’d love to hear it.</p>
      </div>
      <a className="whitespace-nowrap text-xs font-semibold text-[#9ab2ff] max-[480px]:ml-[31px]" href={`${sitePath()}#ask`}>Send me a note <span className="ml-1">↗</span></a>
    </div>
  )
}
