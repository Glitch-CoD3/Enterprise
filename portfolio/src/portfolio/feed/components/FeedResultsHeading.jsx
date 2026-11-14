import { categories } from '../feedUtils.js'

export default function FeedResultsHeading({ filter, count, loading }) {
  const label = categories.find(({ id }) => id === filter)?.label

  return (
    <div className="mb-[13px] flex items-end justify-between gap-4">
      <div><span className="text-[9px] font-bold tracking-[.15em] text-[#a9b5ac]">THE JOURNAL</span><h2 className="mb-0 mt-[5px] font-[Manrope] text-[19px] font-bold tracking-[-.04em]">{label}</h2></div>
      {!loading && <span className="pb-0.5 text-[9px] text-[#859188]">{count} {count === 1 ? 'post' : 'posts'}</span>}
    </div>
  )
}
