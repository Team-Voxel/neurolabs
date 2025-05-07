import React, { useState, useMemo } from 'react';
import { type LayerDefinition, type LayerControl } from '@/nodes/blockLayers';

interface DynamicFormProps {
    layer: LayerDefinition
    onChange?: (values: Record<string, any>) => void
  }

const DynamicForm: React.FC<DynamicFormProps> = ({ layer, onChange }) => {
    const controls = layer.controls ?? {}
  
    const initialValues = useMemo(() => {
      const values: Record<string, any> = {}
      for (const key in controls) {
        values[key] = controls[key].default ?? ''
      }
      return values
    }, [controls])
  
    const [controlValues, setControlValues] = useState(initialValues)
  
    const handleChange = (key: string, newValue: any) => {
      const updated = { ...controlValues, [key]: newValue }
      setControlValues(updated)
      onChange?.(updated)
    }
    const renderControl = (key: string, control: LayerControl) => {
        const value = controlValues[key]
        const label = control.name
    
        switch (control.type) {
          case 'number':
            return (
              <div key={key}>
                <label>{label}</label>
                <input
                  type="number"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={value ?? ''}
                  onChange={e => handleChange(key, Number(e.target.value))}
                />
              </div>
            )
          case 'select':
            return (
              <div key={key}>
                <label>{label}</label>
                <select
                  value={value}
                  onChange={e => handleChange(key, e.target.value)}
                >
                  {control.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )
          case 'text':
            return (
              <div key={key}>
                <label>{label}</label>
                <input
                  type="text"
                  value={value}
                  onChange={e => handleChange(key, e.target.value)}
                />
              </div>
            )
          default:
            return null
        }
      }
    
      return (
        <div>
          <h3>{layer.name}</h3>
          <p>{layer.description}</p>
          {Object.entries(controls).map(([key, control]) =>
            renderControl(key, control)
          )}
        </div>
      )
    }
    
    export default DynamicForm;  