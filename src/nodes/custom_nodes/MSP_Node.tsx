// Model Selection Parent Node

import type { Node, NodeProps } from '@xyflow/react';
import {Button} from '@mui/material'
 
type MSP_Node = Node<{
    stages : string[]
}, 'data'>;

export default function NumberNode({ data }: NodeProps<MSP_Node>) {
  return (
    <>
        <div>
            <div>Model Selection</div>
            <Button variant="contained" color="primary">Log Stages</Button>
        </div>
    </>
  );
}