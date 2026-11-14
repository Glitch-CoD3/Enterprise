import { categories } from '../feedUtils.js'

export default function FeedCategoryTabs({ filter, onChange, postCount }) {
  return (
    <div className="mb-4 flex gap-[5px] overflow-x-auto border-b border-[#2b3730] px-0 pb-3 pt-[3px] [scrollbar-width:thin]" role="tablist" aria-label="Filter posts by category">
      {categories.map((category) => (
        <button
          className={`inline-flex min-h-[36px] shrink-0 items-center gap-[7px] rounded-full border px-3 text-xs font-semibold transition-colors hover:text-[#edf2ed] ${filter === category.id ? 'border-[#34456f] bg-[#202a41] text-[#9ab2ff]' : 'border-transparent bg-transparent text-[#a9b5ac]'}`}
          type="button"
          role="tab"
          aria-selected={filter === category.id}
          key={category.id}
          onClick={() => onChange(category.id)}
        >
          {category.label}
          {category.id === 'all' && <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#30394b] text-[10px] text-[#c3cee6]">{postCount}</span>}
        </button>
      ))}
    </div>
  )
}
