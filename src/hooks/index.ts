export { useDemoData } from './useDemoData'
export { useNavVisibility } from './useNavVisibility'
export { useInfiniteScroll } from './useInfiniteScroll'

// Re-export settings store hook so components can subscribe for re-renders
export { useSettingsStore as useSettings } from '../store/settings'
