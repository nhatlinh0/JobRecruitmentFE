import './FieldFilter.css'

export interface FieldOption {
  name: string
  count: number
}

interface FieldFilterProps {
  options: FieldOption[]
  selected: string
  onSelect: (field: string) => void
}

export function FieldFilter({ options, selected, onSelect }: FieldFilterProps) {
  return (
    <div className="field-filter" id="categories" aria-label="Lọc theo lĩnh vực">
      {options.map((option) => (
        <button
          aria-pressed={selected === option.name}
          className={`field-chip${selected === option.name ? ' selected' : ''}`}
          key={option.name}
          onClick={() => onSelect(option.name)}
          type="button"
        >
          {option.name}<span>{option.count}</span>
        </button>
      ))}
    </div>
  )
}
