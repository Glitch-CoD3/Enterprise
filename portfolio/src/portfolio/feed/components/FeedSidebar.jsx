import { sitePath } from '../../../lib/sitePath.js'
import FeedAvatar from './FeedAvatar.jsx'

export default function FeedSidebar({ name, avatarUrl }) {
  return (
    <aside className="sticky top-[98px] max-[760px]:static max-[760px]:grid max-[760px]:grid-cols-2 max-[760px]:items-stretch max-[760px]:gap-2.5 max-[480px]:grid-cols-1">
      <section className="rounded-[14px] border border-[#2b3730] bg-[#171d19] p-6 max-[760px]:grid max-[760px]:grid-cols-[45px_minmax(0,1fr)] max-[760px]:content-center max-[760px]:gap-x-[11px] max-[760px]:p-[13px]">
        <div className="mb-[13px] max-[760px]:row-span-3 max-[760px]:my-auto max-[760px]:mb-0"><FeedAvatar name={name} imageUrl={avatarUrl} size="large" /></div>
        <h2 className="m-0 font-[Manrope] text-[15px] font-bold max-[760px]:self-end max-[760px]:text-xs">{name}</h2>
        <p className="my-2 text-[11px] leading-[1.7] text-[#a9b5ac] max-[760px]:my-[5px] max-[760px]:text-[9px]">A collection of what I’m learning and creating every day.</p>
        <a className="text-[10px] font-semibold text-[#9ab2ff] max-[760px]:self-start max-[760px]:text-[9px]" href={sitePath()}>Back to my portfolio <span className="ml-1">↗</span></a>
      </section>
      <section className="my-3 flex gap-2.5 rounded-xl border border-[#2d394c] bg-gradient-to-br from-[#1a211d] to-[#1b2030] p-[15px] max-[760px]:my-0 max-[760px]:items-center max-[480px]:hidden">
        <span className="text-base text-[#9ab2ff]" aria-hidden="true">✳</span>
        <p className="m-0 text-[10px] leading-[1.7] text-[#a9b5ac]">Small steps add up. This is where I keep track of mine.</p>
      </section>
      <a className="inline-block px-0 py-2 text-[10px] text-[#859188] hover:text-[#9ab2ff] max-[760px]:col-span-full max-[760px]:px-[3px] max-[760px]:py-0" href={sitePath('admin')}>Portfolio admin <span className="ml-1">↗</span></a>
    </aside>
  )
}
