import { categoryLabels, getVideoEmbed, safeHttpUrl, formatDate } from '../feedUtils.js'
import FeedAvatar from './FeedAvatar.jsx'

const categoryStyles = {
  learning: 'bg-[#202a41] text-[#c3cee6]',
  article: 'bg-[#252b3b] text-[#b8c5ff]',
  clip: 'bg-[#302b22] text-[#d9c293]',
  photo: 'bg-[#2c2534] text-[#c5b4df]',
}

export default function FeedPost({ post, name, avatarUrl, isAdmin, busy, onDelete }) {
  const imageUrl = post.media_type === 'image' ? safeHttpUrl(post.media_url) : ''
  const mediaUrl = post.media_type === 'video' ? safeHttpUrl(post.media_url) : ''
  const video = mediaUrl ? getVideoEmbed(mediaUrl) : null

  return (
    <article className="min-w-0 rounded-[13px] border border-[#2b3730] bg-[#171d19] p-[14px] shadow-lg shadow-black/10 max-[480px]:p-3">
      <div className="flex items-center gap-[9px]">
        <FeedAvatar name={name} imageUrl={avatarUrl} />
        <div className="grid min-w-0 flex-1 gap-1">
          <strong className="text-xs">{name}</strong>
          <time className="text-[10px] text-[#859188]" dateTime={post.created_at}>{formatDate(post.created_at)}</time>
        </div>
        <span className={`rounded-full px-2.5 py-[5px] text-[10px] font-semibold ${categoryStyles[post.category] || 'bg-[#202a41] text-[#c3cee6]'}`}>{categoryLabels[post.category] || 'Post'}</span>
      </div>
      <h3 className="mb-2 mt-4 font-[Manrope] text-[19px] font-bold leading-[1.45] tracking-[-.025em]">{post.title}</h3>
      <p className="m-0 break-words whitespace-pre-wrap text-sm leading-[1.8] text-[#c0cbc1]">{post.body}</p>
      {imageUrl && <img className="mt-[14px] max-h-[360px] w-full rounded-[9px] border border-[#344139] bg-[#111613] object-contain" src={imageUrl} alt={post.title} loading="lazy" />}
      {video?.kind === 'file' && <video className="mt-[14px] max-h-[360px] w-full rounded-[9px] border border-[#344139] bg-[#111613] object-contain" src={video.src} controls preload="metadata" />}
      {video?.kind === 'embed' && (
        <div className="relative mt-[14px] aspect-video w-full overflow-hidden rounded-[9px] border border-[#344139] bg-[#111613]">
          <iframe className="absolute inset-0 h-full w-full border-0" src={video.src} title={post.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
        </div>
      )}
      {video?.kind === 'link' && (
        <a className="mt-[14px] flex items-center gap-3 rounded-[9px] border border-[#34456f] bg-[#202a41] p-[18px] text-[#9ab2ff]" href={video.src} target="_blank" rel="noreferrer">
          <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[#3158c8] text-xs text-white">▶</span>
          <span className="grid gap-1 text-[11px] font-bold">Watch this clip<small className="text-[8px] font-normal text-[#c3cee6]">Opens in a new tab ↗</small></span>
        </a>
      )}
      <div className="mt-[13px] flex items-center justify-between gap-3 border-t border-[#2b3730] pt-[11px] text-[10px] text-[#859188]">
        <span><i className="mr-1 not-italic text-[#9ab2ff]" aria-hidden="true">✳</i> Shared from the learning journal</span>
        {isAdmin && <button className="rounded border border-[#4c3531] bg-transparent px-2 py-[5px] text-[10px] text-[#e7a39a] disabled:cursor-wait disabled:opacity-50" type="button" onClick={() => onDelete(post)} disabled={busy}>Delete</button>}
      </div>
    </article>
  )
}
