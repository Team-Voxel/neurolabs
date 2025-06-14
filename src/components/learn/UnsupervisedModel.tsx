import React, {useState, useEffect} from "react";
import { MulticlassScatterPlot } from "../plotting/MulticlassScatter";
import { trainUnsupervisedSimple } from "../../backend_api/data_api";
import { UnsupervisedModelTrainingInfo } from "../../backend_api/types";
import { SettingControl as SettingControlType } from '../settings/types';
import Settings from '../settings/Settings';
import { Button, Checkbox, Typography } from "antd";

export const UnsupervisedModels = [
    {
        label: 'K-Means',
        value: 'kmeans',
    },
    {
        label: 'Mean Shift',
        value: 'meanshift',
    },
    {
        label: 'DBSCAN',
        value: 'dbscan',
    },
    {
        label: 'Spectral',
        value: 'spectral',
    },
    {
        label: 'Agglomerative',
        value: 'agglomerative',
    },
    {
        label: 'OPTICS',
        value: 'optics',
    },
    {
        label: 'Birch',
        value: 'birch',
    },
    {
        label: 'Gaussian Mixture',
        value: 'gmm',
    }
];


export const UnsupervisedModel: React.FC<{model: string}> = ({model = 'kmeans'}) => {
    const [trainingInfo, setTrainingInfo] = useState<UnsupervisedModelTrainingInfo | null>(null);
    const [isTraining, setIsTraining] = useState<boolean>(false);
    const [param1, setParam1] = useState<any>(undefined);
    const [param2, setParam2] = useState<any>(' ');
    const [tempDataFile, setTempDataFile] = useState<string>('');
    const [modelName, setModelName] = useState<string>(model);
    const [realTimeUpdate, setRealTimeUpdate] = useState<boolean>(false);

    useEffect(() => {
        setModelName(UnsupervisedModels.find(m => m.value === model)?.label || 'K-Means');
        setParam1(undefined);
        setParam2(undefined);
    }, [model]);

    window.fsAPI.getTempDatasetPath().then((tempDataLoc) => {
        setTempDataFile(tempDataLoc);
    });
    
    const fetchModelInfo = async () => {
        setIsTraining(true);
        try {
            const response = await trainUnsupervisedSimple(
                { algorithm: model, 
                    param1: param1, 
                    param2: param2, 
                    data_path: tempDataFile 
                });
            setTrainingInfo(response);
            console.log("Model training info:", response);
        } catch (error) {
            console.error("Error training model:", error);
        } finally {
            setIsTraining(false);
        }
    }

    const onClickCompute = () => {
        if (isTraining || !param1 || !param2) return; // Prevent multiple fetches if already training
        fetchModelInfo();
    }

    useEffect(() => {
        if (isTraining || !param1 || !param2 || !realTimeUpdate) return; // Prevent multiple fetches if already training
        fetchModelInfo();
    }, [param1, param2]);

    const trainingParameters: SettingControlType[] = [
        {
            id: 'n_clusters',
            label: 'Number of Clusters',
            type: 'slider',
            value: param1,
            min: model === 'birch' ? 0 : 1,
            max: 10,
            step: 1,
            onChange: (value) => {setParam1(value);},
            visible: model === 'kmeans' || model === 'spectral' || model === 'agglomerative' || model === 'birch',
        },
        {
            id: 'bandwidth',
            label: 'Bandwidth',
            type: 'slider',
            value: param1,
            min: 0,
            max: 5,
            step: 0.1,
            onChange: (value) => {setParam1(value);},
            visible: model === 'meanshift',
        },
        {
            id: 'eps',
            label: 'Epsilon',
            type: 'slider',
            value: param1,
            min: 0.01,
            max: 0.02,
            step: 0.001,
            onChange: (value) => {setParam1(value);},
            visible: model === 'dbscan',
        },
        {
            id: 'min_samples',
            label: 'Minimum Samples',
            type: 'slider',
            value: param2,
            min: 1,
            max: 10,
            step: 1,
            onChange: (value) => {setParam2(value);},
            visible: model === 'dbscan' || model === 'optics',
        },
        {
            id: 'affinity',
            label: 'Affinity',
            type: 'select',
            value: param2,
            options: [{label: 'RBF', value: 'rbf'}, {label: 'Nearest Neighbors', value: 'nearest_neighbors'}],
            onChange: (value) => {setParam2(value);},
            visible: model === 'spectral',
        },
        {
            id: 'linkage',
            label: 'Linkage',
            type: 'select',
            value: param2,
            options: [{label: 'Ward', value: 'ward'}, {label: 'Complete', value: 'complete'}, {label: 'Average', value: 'average'}],
            onChange: (value) => {setParam2(value);},
            visible: model === 'agglomerative',
        },
        {
            id: 'xi',
            label: 'Xi',
            type: 'slider',
            value: param1,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: (value) => {setParam1(value);},
            visible: model === 'optics',
        },
        {
            id: 'threshold',
            label: 'Threshold',
            type: 'slider',
            value: param2,
            min: 0,
            max: 5,
            step: 0.1,
            onChange: (value) => {setParam2(value);},
            visible: model === 'birch',
        }
    ];

    return (
        <div className='h-full w-full flex flex-row' style={{ minHeight: '100%' }}>
            <div className="flex h-full w-2/3 p-4">
                {trainingInfo ? <MulticlassScatterPlot X={trainingInfo?.X} Y={trainingInfo?.labels} xLabel="X1" yLabel="X2" /> : 
                <div className="flex items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-md m-4 mb-4">
                    <Typography.Title level={4} className="text-center">Click Compute!</Typography.Title>
                </div>}
            </div>
            <div className="flex flex-col h-full w-1/3 p-4 border-l-2 border-gray-200">
                <Typography.Title level={4} className="mt-2 mb-4 text-center">Parameters</Typography.Title>
                <div className="flex flex-row gap-8 w-full ml-3">
                    <Typography.Title level={5}>Update Realtime</Typography.Title>
                    <Checkbox checked={realTimeUpdate} onChange={(e) => setRealTimeUpdate(!realTimeUpdate)}/>
                </div>
                <div>
                <Settings controls={trainingParameters} />
                </div>
                {!realTimeUpdate && <Button type="primary" onClick={onClickCompute}>Compute</Button>}
            </div>
        </div>
    );
}