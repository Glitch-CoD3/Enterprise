export default function FeedEmptyState({ filter }) {
  return (
    <div className="rounded-xl border border-dashed border-[#344139] px-[18px] py-[42px] text-center">
      <span className="text-[22px] text-[#9ab2ff]" aria-hidden="true">✳</span>
      <h3 className="mb-[6px] mt-2.5 font-[Manrope] text-[15px] font-bold">{filter === 'all' ? 'A fresh page.' : 'Nothing here just yet.'}</h3>
      <p className="mx-auto my-0 max-w-[320px] text-[10px] leading-[1.7] text-[#a9b5ac]">{filter === 'all' ? 'The first note is always the hardest. Check back soon for something new.' : 'Try another category or check back later.'}</p>
    </div>
  )
}
