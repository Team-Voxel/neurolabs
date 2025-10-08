import React from 'react';
import { Button, Select, Typography, Upload} from "antd";
import { UploadOutlined } from '@ant-design/icons';
import { DatasetSummary } from '../../backend_api/types';



export interface FileImportFragmentProps {
    datasetSummary: DatasetSummary | null;
    targetColumn: string;
    problemType: string;
    columnHeaders: { value: string }[];
    onFileChange: (file: File | null) => boolean;
    onBack: () => void;
    onNext: () => void;
    onSelectTargetColumn: (value: string) => void;
    onSelectProblemType: (value: string) => void;
    onImport: () => void;
}

export const FileImportFragment: React.FC<FileImportFragmentProps> = (
    {
        targetColumn,
        problemType,
        columnHeaders,
        onFileChange,
        onBack,
        onNext,
        onSelectTargetColumn,
        onSelectProblemType,
        onImport,
    }
) => {

    return (
        <div className='flex-1 flex-col gap-4 items-center mt-8 justify-between'>
                
            <Upload
                beforeUpload={onFileChange}
                maxCount={1}
                accept='.csv'
                onRemove={() => onFileChange(null)}
            >
                <Button icon={<UploadOutlined />} size='large' >Select CSV File</Button>
            </Upload>
            
            <div className='flex justify-between w-full my-4'>
            
                <Typography.Title level={5}>Select Target Column</Typography.Title>
                <div className="w-48">
                    <Select
                    value={targetColumn}
                    onChange={onSelectTargetColumn}
                    className="w-full settings-select"
                    options={columnHeaders}
                    size="middle"
                    />
                </div>
            </div>
            
            <div className='flex justify-between w-full my-4'>
            
                <Typography.Title level={5}>Select Problem Type</Typography.Title>
                <div className="w-48">
                    <Select
                    value={problemType}
                    onChange={onSelectProblemType}
                    className="w-full settings-select"
                    options={[
                        { value: 'classify', label: 'Classification' },
                        { value: 'regress', label: 'Regression' },
                        { value: 'auto', label: 'Detect Automatically' }]}
                    size="middle"
                    />
                </div>
            </div>
            
            <div className='flex flex-row justify-items-stretch gap-4'>
                <Button block type="primary" onClick={onBack}>Back</Button>
                <Button block type="primary" onClick={onImport}>Import</Button>
                <Button block type="primary" onClick={onNext}>Next</Button>
            </div>
        </div>
    );
}