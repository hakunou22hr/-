export type Material = {
  id: string
  name: string
  subject: string
  unit: string
  description: string
}

const modules = import.meta.glob('../materials/*/material.json', {
  eager: true,
  import: 'default',
}) as Record<string, Material>

export const materials = Object.values(modules)
