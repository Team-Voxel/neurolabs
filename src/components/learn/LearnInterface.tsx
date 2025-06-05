import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MulticlassScatterPlot } from '../plotting/MulticlassScatter';
import ContourPlot from '../plotting/ContourPlot';
import { Splitter, Flex, Typography, Switch, Checkbox, Slider, Button, Tabs, TabsProps, Divider} from 'antd';
import type { ModelTrainingInfo, SimpleDataset } from '../../backend_api/types';
import Settings from '../../components/settings/Settings';
import { SettingControl as SettingControlType, SelectOption } from '../../components/settings/types';
import { Model } from './Model';
import { getDatasetSimple } from '../../backend_api/data_api';
import ModelModal from './ModelModal';
import './LearnInterface.css';



type TargetKey = React.MouseEvent | React.KeyboardEvent | string;


export const Models = () => {
    const [models, setModels] = useState<TabsProps['items']>([]);
    const [activeKey, setActiveKey] = useState('1');
    const [selectedModel, setSelectedModel] = useState<string>('None');
    const [modelModal, setModelModal] = useState<boolean>(false);
    
    const onAddNew = (model: string) => {
        if (models) {
            setModels([...models, {
                key: `${models.length + 1}`,
                label: model,
                children: <Model type={model} />
            }]);
            setActiveKey(`${models.length}`)
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

export const LearnInterface: React.FC = () => {
    const [nClasses, setNClasses] = useState(2);
    const [dataset, setDataset] = useState<SimpleDataset | null>(null);
    const [tempDataFile, setTempDataFile] = useState<string>('');
    const navigate = useNavigate();

    window.fsAPI.getTempDatasetPath().then((tempDataLoc) => {
        setTempDataFile(tempDataLoc);
    });

    const onClickGenerate = () => {
        const sendGenerationRequest = async () => {
            try {
                const data = await getDatasetSimple(nClasses, tempDataFile);
                setDataset(data);
            } catch (error) {
                console.error('Error generating dataset:', error);
            }
        }
        sendGenerationRequest();
    }

    return (
        <Splitter style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
            <Splitter.Panel min="20%" max='30%' className='flex flex-col'>
            {/** Left Panel */}
            <Splitter layout="vertical">
                <Splitter.Panel min="70%">
                {/** Top Left Panel */}
                    <Flex vertical>
                        <Flex justify='flex-start' align='flex-start'>
                            <div className='flex flex-row gap-2 mx-2 w-full h-full'>
                                {dataset ? <MulticlassScatterPlot X={dataset.X} Y={dataset.y} xLabel='x1' yLabel='x2'/> : 
                                <div className='flex justify-center items-center h-full w-full border-2 border-dashed border-gray-300 rounded-md'>
                                    <Typography.Title level={4}>Generate Data to see the plot</Typography.Title>
                                </div>}
                            </div>
                        </Flex>
                    </Flex>
                </Splitter.Panel>
                <Splitter.Panel min="20%">
                {/** Bottom Left Panel */}
                    <Flex vertical style={{padding: '10px',gap: '10px'}}>
                    <div className='flex flex-row gap-2 mx-2 items-center'>
                        <Typography.Text>Number of Classes</Typography.Text>
                        <div className='w-40'>
                        <Slider min={0} max={10} value={nClasses} onChange={(value) => setNClasses(value)} step={1}/>
                        </div>
                    </div>
                    <Button type='primary' onClick={() => navigate('/')}>Back</Button>
                    <Button type='primary' onClick={onClickGenerate}>Generate Data</Button>
                    </Flex>
                </Splitter.Panel>
            </Splitter>
            </Splitter.Panel>
            <Splitter.Panel min="50%" className='ml-2'>
            {/** Right Panel */}
                <Models />
            </Splitter.Panel>
        </Splitter>
    )
}