
import { LayerControl } from '../nodes/blockLayers';

  export interface DynamicFormProps {
    controls: {
      [key: string]: LayerControl;
    };
    onChange?: (values: { [key: string]: string | number }) => void;
    className?: string;
  }