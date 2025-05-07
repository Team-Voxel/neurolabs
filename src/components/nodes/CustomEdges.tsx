import { getSmoothStepPath, BaseEdge, useInternalNode, type EdgeProps, type Edge, type ConnectionLineComponentProps  } from '@xyflow/react';

type CustomEdge = Edge<{ value?: number }, 'customSmoothStep'>;

export default function CustomSmoothStepEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
  style,
}: EdgeProps<CustomEdge>) {

  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
 
  if (!sourceNode || !targetNode) {
    return null;
  }
  

  // Apply a vertical offset (e.g., 20px upward)
  let verticalOffset = 0;
  if (sourceNode.height)
     verticalOffset = -sourceNode.height * 0.5;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY: sourceY + verticalOffset,
    sourcePosition,
    targetX,
    targetY: targetY + verticalOffset,
    targetPosition,
  });

  return <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />;
}


export function CustomConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
}: ConnectionLineComponentProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });

  return (
    <path
      fill="none"
      stroke="black"
      strokeWidth={2}
      className="react-flow__connection-path"
      style={{strokeWidth: 2, stroke: 'gray'}}
      d={edgePath}
    />
  );
}