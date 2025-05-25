import React, { useEffect, useState} from 'react';
import {Button} from 'antd';
import Settings from '../../components/settings/Settings';
import { SettingControl as SettingControlType, SelectOption } from '../../components/settings/types';
import {generateDatasetPreview, generateSummaryFromFile} from '../../backend_api/data_api';
import type { DatasetSummary, DataSummaryEntry } from '../../backend_api/types';
import { useWorkflowStore } from '../../AppState';
import { ipcMain } from 'electron';


enum ClusterTypes {
  Blobs = 'blobs',
  Spherical = 'spherical',
  Circles = 'circles',
  SCurve = 's-curve',
  Spiral = 'spiral',
  Moons = 'moons'
}

enum RegressionGenStrat {
  Friedman1 = 'fr1',
  Friedman2 = 'fr2',
  Friedman3 = 'fr3',
  Linear = 'lin',
  GaussianRBF = 'rbf',
  RFF = 'rff',
  Sinusoidal = 'sin',
  GP = 'gp',
}


const D2Clusterings : SelectOption[]= [
{
  label: 'Blobs',
  value: ClusterTypes.Blobs
},
{
  label: 'Moons',
  value: ClusterTypes.Moons
},
{
  label: 'Circles',
  value: ClusterTypes.Circles
}];

const D3Clusterings : SelectOption[]= [
{
  label: 'Blobs',
  value: ClusterTypes.Blobs
},
{
  label: 'S-Curve',
  value: ClusterTypes.SCurve
},
{
  label: 'Spiral',
  value: ClusterTypes.Spiral
}];

const HighDClusterings : SelectOption[]= [
{
  label: 'Blobs',
  value: ClusterTypes.Blobs
},
{
  label: 'Spherical',
  value: ClusterTypes.Spherical
}];

const regAlgorithms = {
  '1D' : [{ label: 'Linear', value: RegressionGenStrat.Linear }, { label: 'Gaussian Process', value: RegressionGenStrat.GP }],
  '2D' : [
    { label: 'Linear', value: RegressionGenStrat.Linear },
    { label: 'Gaussian Process', value: RegressionGenStrat.GP },
  ],
  '3D' : [
    { label: 'Linear', value: RegressionGenStrat.Linear },
    { label: 'Gaussian Process', value: RegressionGenStrat.GP },
  ],
  'High Dimensional' : [
    { label: 'Linear', value: RegressionGenStrat.Linear },
    { label: 'Non Linear Interactions', value: RegressionGenStrat.Friedman1 },
    { label: 'Non Linear Division', value: RegressionGenStrat.Friedman2 },
    { label: 'Non Linear Singularities', value: RegressionGenStrat.Friedman3 },
    { label: 'Gaussian Mixture', value: RegressionGenStrat.GaussianRBF },
    { label: 'Fourier Features', value: RegressionGenStrat.RFF },
    { label: 'Sinusoidal Features', value: RegressionGenStrat.Sinusoidal },
    { label: 'Gaussian Process', value: RegressionGenStrat.GP }
  ]
}

interface DataGenerationProps {
    onGenerate: (data: DatasetSummary) => void;
    onBack: () => void;
    onNext: () => void;
}

export const DataGeneration : React.FC<DataGenerationProps> = ({onGenerate, onBack, onNext}) => {
  const [problemType, setProblemType] = useState<'classify' | 'regress'>('classify');
  const [isClusters, setIsClusters] = useState<boolean>(true);
  const [cluserType, setClusterType] = useState<ClusterTypes>(ClusterTypes.Blobs);
  const [nClusters, setNClusters] = useState<number>(3);
  const [clusterDispersion, setClusterDispersion] = useState<number>(0.5);
  const [dimensionality, setDimensionality] = useState< '1D' | '2D' | '3D' | 'High Dimensional'>('2D');
  const [nFeatures, setNFeatures] = useState<number>(2);
  const [nInformative, setNInformative] = useState<number>(2);
  const [nRedundant, setNRedundant] = useState<number>(0);
  const [nSamples, setNSamples] = useState<number>(10000);
  const [randomState, setRandomState] = useState<number>(3);
  const [noise, setNoise] = useState<number>(1.0);
  const [wfDir, setWfDir] = useState<string>('');

  const [regGenStrat, setRegGenStrat] = useState<RegressionGenStrat>(RegressionGenStrat.Linear);

  window.fsAPI.getTempDatasetPath().then((tempDataLoc) => {
    setWfDir(tempDataLoc);
  });
  
  const onClickGenerate = () => {
    const sendGenerationRequest = async () => {
      try {
        const config = { 
          problem_type: problemType, 
          n_samples: nSamples, 
          n_features: nFeatures, 
          n_informative: nInformative, 
          n_redundant: nRedundant, 
          random_state: randomState, 
          noise: noise, 
          is_clusters: isClusters, 
          cluster_type: cluserType, 
          n_clusters: nClusters, 
          cluster_dispersion: clusterDispersion,
          reg_gen_strat: regGenStrat,
          dimensionality: dimensionality,
          wfDir : wfDir,
        };
        const data = await generateDatasetPreview(config);
        onGenerate(data);
      } catch (err) {
        console.error("Failed to fetch dataset:", err);
      }
    };

    sendGenerationRequest();
  };

  const updateFeatureCountsFromRedn = (nRed) => {
    setNRedundant(nRed);
    setNInformative(nFeatures - nRed);
  }

  const updateFeatureCountsFromInf = (nInf) => {
    setNInformative(nInf);
    setNRedundant(nFeatures - nInf);
  }

  const updateDimensionality = (dim) => {
    setDimensionality(dim);
    if (dim === '1D'){
      setNFeatures(1);
      setIsClusters(false);
      setNRedundant(0);
      setNInformative(1);
      setNClusters(1);
    }
    else if (dim === '2D')
      setNFeatures(2);
    else if (dim === '3D')
      setNFeatures(3);
  }

  const updateRegressionStrat = (strat) => {
    switch (strat) {
      case RegressionGenStrat.Friedman1:
        setNFeatures(5)
        break;
      case RegressionGenStrat.Friedman2:
      case RegressionGenStrat.Friedman3:
        setNFeatures(4);
        break;
    }
    setRegGenStrat(strat);
  }
  
  const regBool = !(regGenStrat === RegressionGenStrat.Friedman1 || regGenStrat === RegressionGenStrat.Friedman2 || regGenStrat === RegressionGenStrat.Friedman3);
  const classficationSettings: SettingControlType[] = [
    {
      id: 'datasetType',
      label: 'Dataset Type',
      type: 'select',
      options: [
        { label: 'Classification', value: 'classify' },
        { label: 'Regression', value: 'regress' }
      ],
      value: problemType,
      onChange: (value) => setProblemType(value),
      tooltip: 'Select the type of dataset to generate',
      visible: true
    },
    {
      id: 'nSamples',
      label: 'Number of samples',
      type: 'number',
      value: nSamples,
      min: 100,
      max: 1000000,
      step: 100,
      onChange: (value) => setNSamples(value),
      tooltip: 'Number of samples to generate',
      visible: true
    },
    {
      id: 'dimensionality',
      label: 'Dimensionality',
      type: 'select',
      options: [
        { label: '1D', value: '1D' },
        { label: '2D', value: '2D' },
        { label: '3D', value: '3D' },
        { label: 'High Dimensional', value: 'High Dimensional' }
      ],
      value: dimensionality,
      onChange: (value) => updateDimensionality(value),
      tooltip: 'Select the dimensionality of the data',
      visible: regBool
    },
    {
      id: 'nFeatures',
      label: 'Number of features',
      type: 'slider',
      value: nFeatures,
      min: 1,
      max: 20,
      step: 1,
      onChange: (value) => setNFeatures(value),
      tooltip: 'Number of features to generate',
      visible: dimensionality === 'High Dimensional' && regBool
    },
    {
      id: 'seed',
      label: 'Generation Seed',
      type: 'number',
      value: randomState,
      min: 0,
      max: Number.MAX_SAFE_INTEGER,
      step: 1,
      onChange: (value) => setRandomState(value),
      tooltip: 'Seed used in generation',
      visible: true
    },
    {
      id: 'isClusters',
      label: 'Generate Clusters',
      type: 'switch',
      value: isClusters,
      onChange: (value) => setIsClusters(value),
      tooltip: 'Determine whether the generator makes clusters or not',
      visible: true && problemType === 'classify' && dimensionality !== '1D'
    },
    {
      id: 'clusterType',
      label: 'Cluster Type',
      type: 'select',
      options: dimensionality === '2D' ? D2Clusterings : dimensionality === '3D' ? D3Clusterings : HighDClusterings,
      value: cluserType,
      onChange: (value) => {setClusterType(value); if (value === ClusterTypes.Circles) setNFeatures(2);},
      tooltip: 'Select the cluster type',
      visible: isClusters && problemType === 'classify' && dimensionality !== '1D'
    },
    {
      id: 'nclusters',
      label: 'Number of Classes',
      type: 'slider',
      value: nClusters,
      min: 1,
      max: 10,
      step: 1,
      onChange: (value) => setNClusters(value),
      tooltip: 'Select the number of clusters',
      visible: isClusters && cluserType === ClusterTypes.Blobs && problemType === 'classify' && dimensionality !== '1D'
    },
    {
      id: 'clusterDispersion',
      label: 'Dispersion',
      type: 'number',
      value: clusterDispersion,
      min: 0,
      max: 5,
      step: 0.01,
      onChange: (value) => setClusterDispersion(value),
      tooltip: 'Standard deviation of the clusters',
      visible: isClusters && cluserType === ClusterTypes.Blobs && problemType === 'classify' && dimensionality !== '1D'
    },
    {
      id: 'nInformative',
      label: 'Informative features',
      type: 'slider',
      value: nInformative,
      min: 1,
      max: nFeatures - nRedundant,
      step: 1,
      onChange: (value) => updateFeatureCountsFromInf(value),
      tooltip: 'Number of informative features',
      visible: !isClusters && problemType === 'classify' && dimensionality !== '1D'
    },
    {
      id: 'nRedundant',
      label: 'Redundant features',
      type: 'slider',
      value: nRedundant,
      min: 0,
      max: nFeatures - nInformative,
      step: 1,
      onChange: (value) => updateFeatureCountsFromRedn(value),
      tooltip: 'Number of redundant features',
      visible: !isClusters && problemType === 'classify' && dimensionality !== '1D'
    },
    {
      id: 'dxr',
      label: 'Generation Strategy',
      type: 'select',
      value: regGenStrat,
      options: regAlgorithms[dimensionality],
      onChange: (value) => updateRegressionStrat(value),
      tooltip: 'Select the generation strategy',
      visible: problemType === 'regress'
    },
    {
      id: 'noise',
      label: 'Noise',
      type: 'number',
      value: noise,
      min: 0.01,
      max: 10,
      step: 0.01,
      onChange: (value) => setNoise(value),
      tooltip: 'Standard deviation of the noise added to the data. (Only when applicable)',
      visible: true
    },
  ];
  
  return (
    <div className='flex-1 flex-col gap-4 items-center mt-4 justify-between'>
      <Settings controls={classficationSettings} />
      <div className='flex flex-row justify-items-stretch gap-4 mt-8'>
        <Button block type="primary" onClick={onBack}>Back</Button>
        <Button block type="primary" onClick={() => onClickGenerate()}>Generate</Button>
        <Button block type="primary" onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}