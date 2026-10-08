export type Material = {
  id: string
  name: string
  subject: string
  unit: string
  description: string
  thumbnail?: string
}

const modules = import.meta.glob('../materials/*/material.json', {
  eager: true,
  import: 'default',
}) as Record<string, Material>

const thumbnails = import.meta.glob('../materials/*/*.svg', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>

// material.json is the single source of truth for both the card and its URL.
export const materials = Object.values(modules).map(material => ({
  ...material,
  thumbnail: material.thumbnail ? thumbnails[`../materials/${material.id}/${material.thumbnail}`] : undefined,
})).sort((a, b) => a.id.localeCompare(b.id))

const normalize = (value: string) => value.toLocaleLowerCase('ja').replace(/[・\s]/g, '')

export function filterMaterials(list: Material[], category: string, query: string) {
  const normalizedQuery = normalize(query)

  return list.filter((material) => {
    const searchableText = normalize(
      `${material.name} ${material.subject} ${material.unit} ${material.description}`,
    )
    const categoryMatches = category === 'すべて'
      || (category === '集合・命題'
        ? /集合|命題/.test(material.unit)
        : material.subject === category || material.unit.includes(category))

    return categoryMatches && (!normalizedQuery || searchableText.includes(normalizedQuery))
  })
}
