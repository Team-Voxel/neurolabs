import React, {useState} from "react";
import { 
  SortableContainer, 
  SortableItem, 
  DragHandle, 
  NestedSortableItem 
} from './dnd';
import { ErrorBoundary } from './ErrorBoundary';
import { GripVertical, Move, ListChecks, LayoutGrid, Menu } from 'lucide-react';


const initialItems = ['item-1', 'item-2', 'item-3', 'item-4', 'item-5'];
const nestedItems = {
  'item-1': [''],
  'item-2': [''],
  'item-3': [''],
  'item-4': [''],
  'item-5': [''],
};

const itemContent = {
  'item-1': 'Marketing Campaign',
  'item-2': 'Website Redesign',
  'item-3': 'Mobile App Development',
  'item-4': 'Content Strategy',
  'item-5': 'Product Launch'
};

function SortablePipeline() {
  const [items, setItems] = useState(initialItems);
  const [direction, setDirection] = useState<'vertical' | 'horizontal' | 'both'>('vertical');
  const [useDragHandle, setUseDragHandle] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Simulate loading state
  const handleSimulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Drag and Drop Container</h1>
            <p className="text-gray-600 mb-6">
              A fully customizable drag-and-drop container with sorting capabilities.
            </p>
            
            {/* Control buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => setDirection('vertical')}
                className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                  direction === 'vertical' 
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                <ListChecks size={18} className="mr-2" />
                Vertical
              </button>
              
              <button
                onClick={() => setDirection('horizontal')}
                className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                  direction === 'horizontal' 
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                <LayoutGrid size={18} className="mr-2" />
                Horizontal
              </button>
              
              <button
                onClick={() => setDirection('both')}
                className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                  direction === 'both' 
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                <Move size={18} className="mr-2" />
                Both
              </button>
              
              <button
                onClick={() => setUseDragHandle(!useDragHandle)}
                className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                  useDragHandle 
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                <GripVertical size={18} className="mr-2" />
                {useDragHandle ? 'Using Drag Handle' : 'Drag Anywhere'}
              </button>
              
              <button
                onClick={handleSimulateLoading}
                disabled={loading}
                className="flex items-center px-3 py-2 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? 'Loading...' : 'Simulate Loading'}
              </button>
            </div>
            
            {/* Drag and drop container */}
            <ErrorBoundary>
              {(
                <SortableContainer
                  items={items}
                  onItemsChange={setItems}
                  direction={direction}
                  className="w-full"
                  containerClassName={direction === 'horizontal' ? 'flex-wrap gap-4' : 'space-y-4'}
                  onDragStart={(id) => console.log('Drag started:', id)}
                  onDragEnd={(id) => console.log('Drag ended:', id)}
                  isLoading={loading}
                >
                  {items.map((id) => (
                    <SortableItem 
                      key={id} 
                      id={id}
                      className={direction === 'horizontal' ? 'w-[calc(33.333%-1rem)] sm:w-[calc(25%-1rem)]' : 'w-full'}
                      dragHandleSelector={useDragHandle ? '[data-drag-handle]' : undefined}
                    >
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-800">{itemContent[id as keyof typeof itemContent]}</span>
                        </div>
                      </div>
                    </SortableItem>
                  ))}
                </SortableContainer>
              )}
            </ErrorBoundary>
          </div>
        </div>
        
        {/* Current item order display */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Current Order</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="text-sm text-gray-700 overflow-x-auto">
                {JSON.stringify(items, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SortablePipeline;