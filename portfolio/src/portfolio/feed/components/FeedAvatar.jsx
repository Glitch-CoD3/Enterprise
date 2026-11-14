import { initials } from '../feedUtils.js'

export default function FeedAvatar({ name, imageUrl, size = 'small' }) {
  const sizeClass = size === 'large' ? 'h-16 w-16 text-base' : 'h-9 w-9 text-[11px]'

  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden rounded-full border border-[#34456f] bg-[#202a41] font-[Manrope] font-bold text-[#9ab2ff] ${sizeClass}`}>
      {imageUrl ? <img className="h-full w-full object-cover" src={imageUrl} alt="" /> : initials(name)}
    </span>
  )
}
