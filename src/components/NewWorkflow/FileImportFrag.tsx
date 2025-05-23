import React, { useEffect, useState } from 'react';
import { Button, Select, Typography, Upload } from "antd";
import { UploadOutlined } from '@ant-design/icons';


export interface FileImportFragmentProps {
    targetColumn: string;
    columnHeaders: { value: string }[];
    onFileChange: (file: File) => void;
    onBack: () => void;
    onNext: () => void;
    onSelectTargetColumn: (value: string) => void;
    onImport: () => void;
}

export const FileImportFragment: React.FC<FileImportFragmentProps> = (
    {
        targetColumn,
        columnHeaders,
        onFileChange,
        onBack,
        onNext,
        onSelectTargetColumn,
        onImport,
    }
) => {

    return (
        <div className='flex-1 flex-col gap-4 items-center mt-8 justify-between'>
                
            <Upload
                beforeUpload={onFileChange}
                maxCount={1}
                accept='.csv'

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
            
            <div className='flex flex-row justify-items-stretch gap-4'>
                <Button block type="primary" onClick={onBack}>Back</Button>
                <Button block type="primary" onClick={onImport}>Import</Button>
                <Button block type="primary" onClick={onNext}>Next</Button>
            </div>
        </div>
    );
}