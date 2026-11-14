import { categories } from '../feedUtils.js'

export default function FeedCategoryTabs({ filter, onChange, postCount }) {
  return (
    <div className="mb-4 flex gap-[5px] overflow-x-auto border-b border-[#2b3730] px-0 pb-3 pt-[3px] [scrollbar-width:thin]" role="tablist" aria-label="Filter posts by category">
      {categories.map((category) => (
        <button
          className={`inline-flex min-h-[34px] shrink-0 items-center gap-[7px] rounded-full border px-[11px] text-[10px] font-semibold transition-colors hover:text-[#edf2ed] ${filter === category.id ? 'border-[#34456f] bg-[#202a41] text-[#9ab2ff]' : 'border-transparent bg-transparent text-[#a9b5ac]'}`}
          type="button"
          role="tab"
          aria-selected={filter === category.id}
          key={category.id}
          onClick={() => onChange(category.id)}
        >
          {category.label}
          {category.id === 'all' && <span className="grid h-[17px] min-w-[17px] place-items-center rounded-full bg-[#30394b] text-[8px] text-[#c3cee6]">{postCount}</span>}
        </button>
      ))}
    </div>
  )
}
