import type { Category } from '../../types'
import { getMerchantIconProps } from '../../utils/merchantIcon'

interface MerchantAvatarProps {
  title: string
  category: Category
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-11 h-11 text-sm',
}

export default function MerchantAvatar({ title, category, size = 'md' }: MerchantAvatarProps) {
  const { initials, color } = getMerchantIconProps(title, category)
  return (
    <div
      className={`${SIZES[size]} rounded-xl flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}
