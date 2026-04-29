'use client'
import FormRenderer from './FormRenderer'
import TableRenderer from './TableRenderer'
import { UIComponent } from '@/types/config'

interface DashboardRendererProps {
  components: UIComponent[]
  token: string
}

export default function DashboardRenderer({ components, token }: DashboardRendererProps) {
  if (!components || components.length === 0) {
    return <div className="p-4 text-gray-500">No components configured</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {components.map(comp => {
        if (comp.type === 'form' && comp.fields) {
          return (
            <div key={comp.id} className="p-4 border rounded">
              <h3 className="text-lg font-semibold mb-4">{comp.title}</h3>
              <FormRenderer fields={comp.fields} apiBinding={comp.api_binding} token={token} />
            </div>
          )
        }
        if (comp.type === 'table' && comp.fields) {
          return (
            <div key={comp.id} className="p-4 border rounded col-span-full">
              <h3 className="text-lg font-semibold mb-4">{comp.title}</h3>
              <TableRenderer fields={comp.fields} apiBinding={comp.api_binding} token={token} />
            </div>
          )
        }
        return (
          <div key={comp.id} className="p-4 border rounded">
            <p className="text-red-500">Unknown component type: {comp.type}</p>
          </div>
        )
      })}
    </div>
  )
}
