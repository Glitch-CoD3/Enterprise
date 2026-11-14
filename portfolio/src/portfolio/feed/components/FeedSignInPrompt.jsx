import { sitePath } from '../../../lib/sitePath.js'

export default function FeedSignInPrompt({ sessionReady, adminError }) {
  return (
    <div className="mb-[30px] flex flex-wrap items-center gap-3 rounded-xl border border-[#2b3730] bg-[#171d19] p-[15px]">
      <span className="text-[19px] text-[#9ab2ff]" aria-hidden="true">✳</span>
      <div className="flex-1 max-[480px]:basis-[calc(100%-34px)]">
        <strong className="text-[11px]">Have something to share?</strong>
        <p className="mb-0 mt-1 text-[9px] text-[#a9b5ac]">{sessionReady ? 'Sign in as the portfolio administrator to add a post.' : 'Checking sign-in status…'}</p>
      </div>
      {sessionReady && <a className="whitespace-nowrap text-[9px] font-semibold text-[#9ab2ff] max-[480px]:ml-[31px]" href={sitePath('admin')}>Admin sign in <span className="ml-1">↗</span></a>}
      {adminError && <small className="w-full text-[9px] text-[#e6a99f]" role="status">{adminError}</small>}
    </div>
  )
}
