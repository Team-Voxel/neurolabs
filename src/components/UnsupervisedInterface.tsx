import React, { useState, useEffect } from 'react';
import { MulticlassScatterPlot } from './plotting/MulticlassScatter';
import { trainUnsupervisedSimple } from './../backend_api/data_api';
import { UnsupervisedModelTrainingInfo } from './../backend_api/types';
import { Typography, Button, Checkbox } from 'antd';
import Settings from './settings/Settings';
import { SettingControl as SettingControlType } from './settings/types';
import Papa, {ParseResult} from 'papaparse';

export interface UnsupervisedInterfaceProps {
    dataSrc: string;
    targetColumn: string;
}

export const UnsupervisedInterface: React.FC<UnsupervisedInterfaceProps> = ({ dataSrc, targetColumn }) => {

    const [trainingInfo, setTrainingInfo] = useState<UnsupervisedModelTrainingInfo | null>(null);
    const [isTraining, setIsTraining] = useState<boolean>(false);
    const [numClusters, setNumClusters] = useState<number>(3);
    const [bandwidth, setBandwidth] = useState<number>(1.0);
    const [epsilon, setEpsilon] = useState<number>(0.01);
    const [minSamples, setMinSamples] = useState<number>(5);
    const [affinity, setAffinity] = useState<string>('rbf');
    const [linkage, setLinkage] = useState<string>('ward');
    const [xi, setXi] = useState<number>(0.05);
    const [threshold, setThreshold] = useState<number>(1.0);
    const [model, setModel] = useState<string>('kmeans');
    const [realTimeUpdate, setRealTimeUpdate] = useState<boolean>(false);
    const [requireDimensionReduction, setRequireDimensionReduction] = useState<boolean>(false);
    const [dimReductionMethod, setDimensionReductionMethod] = useState<string>('pca');

    const [clusters, setClusters] = useState<string>('actual');

    window.fsAPI.readFile(dataSrc).then((data) => {
        if (data) {
            Papa.parse(data, {
                header: true,
                skipEmptyLines: true,
                complete: (results: ParseResult<unknown>) => {
                    const numColumns = Object.keys(results.data[0]).length;
                    if (numColumns > 2) {
                        setRequireDimensionReduction(true);
                    } else {
                        setRequireDimensionReduction(false);
                    }
                },
                error: (err: Error) => {
                    setRequireDimensionReduction(false);
                    console.error("Error parsing data:", err);
                },
                });
        } else {
            console.error("Critical Error! No data file for the current project.");
        }
    }).catch((error) => {
        console.error("Error fetching data file:", error);
    });
    
    const fetchModelInfo = async () => {
        setIsTraining(true);
        try {
            const response = await trainUnsupervisedSimple(
                {   algorithm: model, 
                    n_clusters: numClusters,
                    bandwidth: bandwidth,
                    eps: epsilon,
                    min_samples: minSamples,
                    affinity: affinity,
                    linkage: linkage,
                    xi: xi,
                    threshold: threshold,
                    data_path: dataSrc,
                    require_dimension_reduction: requireDimensionReduction,
                    dim_redux_method: dimReductionMethod,
                    target: targetColumn
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
        if (isTraining) return; // Prevent multiple fetches if already training
        fetchModelInfo();
    }

    useEffect(() => {
        if (isTraining || !realTimeUpdate) return; // Prevent multiple fetches if already training
        fetchModelInfo();
    }, [numClusters, bandwidth, epsilon, minSamples, affinity, linkage, xi, threshold]);

    const trainingParameters: SettingControlType[] = [
        {
            id: 'model',
            label: 'Model',
            type: 'select',
            options: [
                {label: 'K-Means Clustering', value: 'kmeans'},
                {label: 'Agglomerative Clustering', value: 'agglomerative'},
                {label: 'Mean Shift Clustering', value: 'meanshift'},
                {label: 'DBSCAN', value: 'dbscan'},
                {label: 'OPTICS', value: 'optics'},
                {label: 'Spectral Clustering', value: 'spectral'},
            ],
            value: model,
            onChange: (value) => {setModel(value);},
            visible: true,
        },
        {
            id: 'clusters',
            label: 'Clusters',
            type: 'select',
            options: [{label: 'Actual', value: 'actual'}, {label: 'Predicted', value: 'predicted'}],
            value: clusters,
            onChange: (value) => {setClusters(value);},
            visible: true,
            tooltip: 'Actual: Clusters from the dataset, Predicted: Clusters from the model',
        },
        {
            id: 'dim_redux_method',
            label: 'Dimensionality Reduction Method',
            type: 'select',
            options: [
                {label: 'PCA', value: 'pca'},
                {label: 'UMAP', value: 'umap'},
                {label: 'ISOMAP', value: 'isomap'},
                {label: 'LLE', value: 'lle'},
                {label: 'MDS', value: 'mds'},
            ],
            tooltip: 'PCA: Principal Component Analysis, LLE: Locally Linear Embedding, MDS: Multidimensional Scaling, UMAP: Uniform Manifold Approximation and Projection',
            value: dimReductionMethod,
            onChange: (value) => {setDimensionReductionMethod(value);},
            visible: requireDimensionReduction,
        },
        {
            id: 'n_clusters',
            label: 'Number of Clusters',
            type: 'slider',
            value: numClusters,
            min: model === 'birch' ? 0 : 1,
            max: 10,
            step: 1,
            onChange: (value) => {setNumClusters(value);},
            visible: model === 'kmeans' || model === 'spectral' || model === 'birch',
        },
        {
            id: 'bandwidth',
            label: 'Bandwidth',
            type: 'slider',
            value: bandwidth,
            min: 0,
            max: 5,
            step: 0.1,
            onChange: (value) => {setBandwidth(value);},
            visible: model === 'meanshift',
        },
        {
            id: 'eps',
            label: 'Epsilon',
            type: 'slider',
            value: epsilon,
            min: 0.01,
            max: 0.02,
            step: 0.001,
            onChange: (value) => {setEpsilon(value);},
            visible: model === 'dbscan',
        },
        {
            id: 'min_samples',
            label: 'Minimum Samples',
            type: 'slider',
            value: minSamples,
            min: 1,
            max: 10,
            step: 1,
            onChange: (value) => {setMinSamples(value);},
            visible: model === 'dbscan' || model === 'optics',
        },
        {
            id: 'affinity',
            label: 'Affinity',
            type: 'select',
            value: affinity,
            options: [{label: 'RBF', value: 'rbf'}, {label: 'Nearest Neighbors', value: 'nearest_neighbors'}],
            onChange: (value) => {setAffinity(value);},
            visible: model === 'spectral',
        },
        {
            id: 'linkage',
            label: 'Linkage',
            type: 'select',
            value: linkage,
            options: [{label: 'Ward', value: 'ward'}, {label: 'Complete', value: 'complete'}, {label: 'Average', value: 'average'}],
            onChange: (value) => {setLinkage(value);},
            visible: model === 'agglomerative',
        },
        {
            id: 'xi',
            label: 'Xi',
            type: 'slider',
            value: xi,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: (value) => {setXi(value);},
            visible: model === 'optics',
        },
        {
            id: 'threshold',
            label: 'Threshold',
            type: 'slider',
            value: threshold,
            min: 0,
            max: 25,
            step: 0.1,
            onChange: (value) => {setThreshold(value);},
            visible: model === 'birch' || model === 'agglomerative',
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
};