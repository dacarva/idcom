type ClassValue = string | number | null | false | undefined

export function cn (...values: ClassValue[]) {
	return values.filter(Boolean).join(' ')
}
