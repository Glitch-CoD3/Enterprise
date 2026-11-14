import { getSkillImage, isShieldsBadge } from '../content.js'

export default function SkillBadge({ skill }) {
  const icon = getSkillImage(skill.icon_url)
  const badge = isShieldsBadge(icon.url)

  return (
    <div className={`skill-row${badge ? ' skill-row-badge' : ''}`}>
      {icon.url
        ? <img className={badge ? 'skill-badge-image' : 'skill-icon'} src={icon.url} alt={badge ? icon.alt || skill.name : ''} loading="lazy" decoding="async" />
        : <span className="skill-icon-placeholder" aria-hidden="true">{skill.name.slice(0, 2).toUpperCase()}</span>}
      {!badge && <span className="skill-name">{skill.name}</span>}
    </div>
  )
}
