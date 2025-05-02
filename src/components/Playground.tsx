import React from "react";
import { useNavigate } from "react-router-dom";
import Canvas from "../nodes/Canvas";
import { ReactFlowProvider } from "@xyflow/react";
import { DnDProvider } from "../nodes/dndContext";


export const Playground: React.FC = () => {
    
    return (
        <div className="flex flex-row items-center h-screen w-screen bg-gray-100">
            <div className="flex flex-col w-1/5 h-full overflow-y-auto">
            </div>
            <div className="flex flex-col w-3/5 h-full overflow-y-auto bg-white p-4">
                <h1 className="text-2xl font-bold mb-4">Playground</h1>
                <p className="text-gray-700">This is the playground area where you can experiment with different components.</p>
                {/* Add your playground content here */}
                <ReactFlowProvider>
                <DnDProvider>
                <Canvas />
                </DnDProvider>
                </ReactFlowProvider>
            </div>
            <div className="flex flex-col w-1/5 h-full overflow-y-auto bg-gray-200 p-4">
                <h2 className="text-xl font-semibold mb-4">Sidebar</h2>
                <p className="text-gray-700">This is the sidebar area.</p>
                {/* Add your sidebar content here */}
            </div>
        </div>
    );

}
