import React, { useState, useEffect } from 'react';
import { MulticlassScatterPlot } from './plotting/MulticlassScatter';
import { trainUnsupervisedSimple } from './../backend_api/data_api';
import { UnsupervisedModelTrainingInfo } from './../backend_api/types';
import { Typography, Button, Card, Popover, Statistic, message } from 'antd';
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
    const [findOptimalClusters, setFindOptimalClusters] = useState<boolean>(false);
    const [optimalClusterMethod, setOptimalClusterMethod] = useState<string>('silhouette');

    const [clusters, _setClusters] = useState<string>('predicted');

    window.fsAPI.readFile(dataSrc).then((data) => {
        if (data) {
            Papa.parse(data, {
                header: true,
                skipEmptyLines: true,
                complete: (results: ParseResult<unknown>) => {
                    const numColumns = Object.keys(results.data[0]).length;
                    if (numColumns > 3) {
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
                    target: targetColumn,
                    find_optimal_clusters: findOptimalClusters,
                    optimal_clusters_method: optimalClusterMethod,
                });
            setTrainingInfo(response);
            message.success("Model trained successfully!");
        } catch (error) {
            message.error("Error training model: " + (error instanceof Error ? error.message : "Unknown error"));
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
    }, [numClusters, bandwidth, epsilon, minSamples, affinity, linkage, xi, threshold, optimalClusterMethod]);
    
    useEffect(() => {
        if (isTraining) return; // Prevent multiple fetches if already training
        fetchModelInfo();
    }, [findOptimalClusters]);

    const trainingParameters: SettingControlType[] = [
        {
            id: 'update-mode',
            label: 'Update in Realtime',
            type: 'switch',
            value: realTimeUpdate,
            onChange: (value) => {setRealTimeUpdate(value);},
            visible: true,
            tooltip: 'If enabled, the model will be updated in real-time as parameters change.',
        },
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
            id: 'find-opt',
            label: 'Find Optimal Clusters',
            type: 'switch',
            value: findOptimalClusters,
            onChange: (value) => {setFindOptimalClusters(value);},
            visible: true,
            tooltip: 'If enabled, the optimal number of clusters will be determined using the specified method.',
        },
        {
            id: 'optimal-cluster-method',
            label: 'Optimal Cluster Method',
            type: 'select',
            options: [
                {label: 'Elbow Method', value: 'elbow'},
                {label: 'Silhouette Score', value: 'silhouette'}
            ],
            value: optimalClusterMethod,
            onChange: (value) => {setOptimalClusterMethod(value);},
            visible: findOptimalClusters,
            tooltip: 'Elbow Method: Plots the sum of squared distances to find the optimal number of clusters. Silhouette Score: Measures how similar an object is to its own cluster compared to other clusters.',
        },/* 
        {
            id: 'clusters',
            label: 'Clusters',
            type: 'select',
            options: [{label: 'Actual', value: 'actual'}, {label: 'Predicted', value: 'predicted'}],
            value: clusters,
            onChange: (value) => {setClusters(value);},
            visible: true,
            tooltip: 'Actual: Clusters from the dataset, Predicted: Clusters from the model',
        }, */
        {
            id: 'n_clusters',
            label: 'Number of Clusters',
            type: 'slider',
            value: numClusters,
            min: model === 'birch' ? 0 : 1,
            max: 10,
            step: 1,
            onChange: (value) => {setNumClusters(value);},
            visible: (model === 'kmeans' || model === 'spectral' || model === 'birch') && !findOptimalClusters,
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
    ];

    return (
        <div className='h-full w-full flex flex-row' style={{ minHeight: '100%' }}>
            <div className='flex flex-col h-full  w-2/3 p-4'>
                <Typography.Title level={3} className="text-center mb-4 w-full">Clustering Output</Typography.Title>
                <div className="flex-1 w-full">
                    {trainingInfo ? <MulticlassScatterPlot X={trainingInfo?.X} Y={clusters === 'actual' ? trainingInfo.actualLabels : trainingInfo?.labels} xLabel="X1" yLabel="X2" /> : 
                    <div className="flex items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-md mb-4">
                        <Typography.Title level={4} className="text-center">Click Compute!</Typography.Title>
                    </div>}
                </div>
            </div>
            <div className="flex flex-col h-full w-1/3 p-4 border-l-2 border-gray-200 overflow-y-auto">
                <Typography.Title level={4} className="mt-2 mb-4 mx-2 text-center">Parameters</Typography.Title>
                <div>
                <Settings controls={trainingParameters} />
                </div>
                {!realTimeUpdate && <Button type="primary" onClick={onClickCompute} block>Compute</Button>}
                <div className='flex-1 flex-row'>
                <Popover content='Computed silhouette score. Higher is better' title="Clustering Score" placement='top' mouseEnterDelay={0.7}>
                <Card variant="borderless" size='default'>
                    <Statistic title="Clustering Score" valueStyle={{fontSize:'20px'}}  value={trainingInfo?.silhouette} precision={2}/>
                </Card>
                </Popover>
                {trainingInfo?.explainedVariance && <Popover content='It is the number of true positives divided by the number of true positives and false positives.' title="Precision" placement='top' mouseEnterDelay={0.7}>
                <Card variant="borderless" size='default'>
                    <Statistic title="Precision" valueStyle={{fontSize:'20px'}}  value={trainingInfo?.explainedVariance} precision={2}/>
                </Card>
                </Popover>}
                </div>
            </div>
        </div>
    );
};