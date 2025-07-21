import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MulticlassScatterPlot } from '../plotting/MulticlassScatter';
import { Flex, Typography, Button, Tabs, TabsProps, Select} from 'antd';
import type { SimpleDataset } from '../../backend_api/types';
import { SupervisedModel } from './SupervisedModel';
import { getDatasetSimple } from '../../backend_api/data_api';
import ModelModal from './ModelModal';
import './LearnInterface.css';
import { Sidebar } from '../Sidebar';
import { Brain, ScatterChart } from 'lucide-react';
import { UnsupervisedInterface } from '../UnsupervisedInterface';



type TargetKey = React.MouseEvent | React.KeyboardEvent | string;
const modelMap : Record<string, string> = {
    'logistic' : 'Logistic',
    'svm' : 'SVM',
    'tree': 'Decision Tree',
    'forest': 'Random Forest',
    'gb': 'Gradient Boosting',
    'knn': 'KNN',
    'nn': 'Neural Network',
}

export const SupervisedInterface = () => {
    const [models, setModels] = useState<TabsProps['items']>([]);
    const [activeKey, setActiveKey] = useState('1');
    const [_selectedModel, setSelectedModel] = useState<string>('None');
    const [modelModal, setModelModal] = useState<boolean>(false);
    
    const onAddNew = (model: string) => {
        if (models) {
            setModels([...models, {
                key: `${models.length + 1}`,
                label: modelMap[model] || model,
                children: <SupervisedModel type={model} />
            }]);
            setActiveKey(`${models.length + 1}`);
        }
        setSelectedModel('None');
    }

    const onSelect = (model: string) => {
        setSelectedModel(model);
        setModelModal(false);
        onAddNew(model);
    }

    const onDelete = (targetKey: TargetKey) => {
        if (models) {
            setModels(models.filter((model) => model.key !== targetKey));
            setActiveKey(`${models.length}`);
        }
    }

    const onEdit = (targetKey: TargetKey, action: 'add' | 'remove') => {
        if (action === 'add') {
          setModelModal(true);
        } else {
          onDelete(targetKey);
        }
      };


    return (
        <div className='h-full w-full'>
        <div className='h-full w-full flex flex-col'>
        <Tabs type="editable-card"
            size='small'
            activeKey={activeKey}
            onChange={setActiveKey}
            onEdit={onEdit}
            items={models}
            className='h-full flex-1'
            style={{ 
                display: 'flex', 
                flexDirection: 'column',
                height: '100%'
            }}
            tabBarStyle={{ margin: 0 }}
            tabPosition="top"
        />
        </div>
        
        <ModelModal
            visible={modelModal}
            onClose={() => setModelModal(false)}
            onSelect={onSelect}
        />
        </div>
    )
}
/* const models : TabsProps['items'] = [
    {
        key: 'kmeans',
        label: 'K-Means',
        children: <UnsupervisedModel model='kmeans' />
    },
    {
        key: 'dbscan',
        label: 'DBSCAN',
        children: <UnsupervisedModel model='dbscan' />
    },
    {
        key: 'agglomerative',
        label: 'Agglomerative Clustering',
        children: <UnsupervisedModel model='agglomerative' />
    },
    {
        key: 'birch',
        label: 'BIRCH',
        children: <UnsupervisedModel model='birch' />
    },
    {
        key: 'spectral',
        label: 'Spectral Clustering',
        children: <UnsupervisedModel model='spectral' />
    },
    {
        key: 'optics',
        label: 'OPTICS',
        children: <UnsupervisedModel model='optics' />
    }
]; */

export const LearnInterface: React.FC = () => {
    const [mode, setMode] = useState<number>(0);
    const [difficulty, setDifficulty] = useState('medium');
    const [dataset, setDataset] = useState<SimpleDataset | null>(null);
    const [tempDataFile, setTempDataFile] = useState<string>('');
    const navigate = useNavigate();

    window.fsAPI.getTempDatasetPath().then((tempDataLoc) => {
        setTempDataFile(tempDataLoc);
    });

    const onClickGenerate = () => {
        const sendGenerationRequest = async () => {
            try {
                const data = await getDatasetSimple({difficulty: difficulty, wfDir: tempDataFile});
                setDataset(data);
            } catch (error) {
                console.error('Error generating dataset:', error);
            }
        }
        sendGenerationRequest();
    }

    return (
        <div className='flex flex-row h-screen w-screen'>
            <Sidebar
                buttons={[
                    {
                        label: 'Supervised Learning',
                        icon: <Brain />,
                        callback: () => setMode(0)
                    },
                    {
                        label: 'Unsupervised Learning',
                        icon: <ScatterChart />,
                        callback: () => setMode(1)
                    }
                ]}
                onHome={() => navigate('/')}
                selectedTab={mode}
            />
            <div className='flex flex-col h-full w-3/10 border-r-2 border-gray-400'>
            {/** Left Panel */}
            <div className='flex flex-col h-full'>
                <div className='flex h-7/10'>
                {/** Top Left Panel */}
                        <div className='flex flex-col w-full h-full justify-start'>
                            <Typography.Title level={3} className='text-center pt-4'>Data Points</Typography.Title>
                            <div className='flex-1 min-h-0 w-full p-2'>
                                {dataset ? <MulticlassScatterPlot ignoreY={mode===1} X={dataset.X} Y={dataset.y} xLabel='x1' yLabel='x2'/> : 
                                <div className='flex-1 justify-center items-center h-full w-full border-2 border-dashed border-gray-300 rounded-md'>
                                    <Typography.Title level={4}>Generate Data to see the plot</Typography.Title>
                                </div>}
                            </div>
                        </div>
                </div>
                <div className='flex-1 h-3/10'>
                {/** Bottom Left Panel */}
                    <Flex vertical style={{padding: '10px',gap: '10px'}}>
                    <div className='flex flex-row gap-6 items-center justify-between'>
                        <Typography.Text>Classification Difficulty</Typography.Text>
                        <div className='flex-1 w-48'>
                        <Select className='w-full' options={[{value:'low', label:'Low'}, {value:'medium', label:'Medium'}, {value:'high', label:'High'}, {value:'very_high', label:'Very High'}]} value={difficulty} onChange={(value) => setDifficulty(value)}/>
                        </div>
                    </div>
                    <Button type='primary' onClick={onClickGenerate}>Generate Data</Button>
                    </Flex>
                </div>
            </div>
            </div>
            <div className='flex ml-2 h-full w-7/10'>
            {/** Right Panel */}
            {mode === 0 ?
                <SupervisedInterface /> : 
                <UnsupervisedInterface dataSrc={tempDataFile} targetColumn='y' />
            }
            </div>
        </div>
    )
}