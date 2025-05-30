import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Popover, Select, Typography, Upload , Radio, Space} from "antd";
import { UploadOutlined } from '@ant-design/icons';
import { DatasetSummary } from '../../backend_api/types';

const messages1 = (
    <div>
        <Typography.Text>
            Your dataset has features that have greatly varying scales and outliers. 
        </Typography.Text>
        <Typography.Text>
            You can either standardize the data while keeping the outliers or remove the outliers and then normalize the data.
        </Typography.Text>
        <Typography.Text>
            Normalization is recommended for most machine learning algorithms.
        </Typography.Text>
    </div>
)

const messages2 = (
    <div>
        <Typography.Text>
            Your dataset contains outliers. 
        </Typography.Text>
        <Typography.Text>
            You can either keep the outliers or remove them.
        </Typography.Text>
        <Typography.Text>
            Removing outliers can introduce bias if they are significant, but it can also improve model performance.
        </Typography.Text>
    </div>
)

const messages3 = (
    <div>
    <Typography.Text>
        Your dataset contains features that are not on the same scale. 
    </Typography.Text>
    <Typography.Text>
        You can either normalize the data or standardize it.
    </Typography.Text>
    <Typography.Text>
        Normalization is recommended for most machine learning algorithms.
    </Typography.Text>
</div>
)  


const { Paragraph, Text } = Typography;

const choices = [
  {
    value: 'standardize_keep',
    title: 'Standardize & Keep Outliers',
    description: (
      <>
        <Paragraph><Text strong>What it does:</Text> Applies z-score scaling (mean→0, σ→1) but leaves extreme values in place.</Paragraph>
        <Paragraph><Text strong>Pros:</Text> Preserves rare signals, equalizes variance, suits centered-data models.</Paragraph>
        <Paragraph><Text strong>Cons:</Text> Outliers remain extreme; transform is unbounded.</Paragraph>
      </>
    ),
  },
  {
    value: 'remove_normalize',
    title: 'Remove Outliers & Normalize',
    description: (
      <>
        <Paragraph><Text strong>What it does:</Text> Drops points beyond outlier threshold, then rescales features to [0,1].</Paragraph>
        <Paragraph><Text strong>Pros:</Text> Prevents outliers from skewing range; bounds inputs.</Paragraph>
        <Paragraph><Text strong>Cons:</Text> Loses extreme observations; may mask residual tails.</Paragraph>
      </>
    ),
  },
  {
    value: 'remove_keep',
    title: 'Remove Outliers',
    description: (
      <>
        <Paragraph><Text strong>What it does:</Text> Removes extreme values without changing remaining units.</Paragraph>
        <Paragraph><Text strong>Pros:</Text> Cleans anomalies.</Paragraph>
        <Paragraph><Text strong>Cons:</Text> Can introduce bias into the model.</Paragraph>
      </>
    ),
  },
  {
    value: 'keep_original',
    title: 'Keep Outliers',
    description: (
      <>
        <Paragraph><Text strong>What it does:</Text> Leaves data unchanged.</Paragraph>
        <Paragraph><Text strong>Pros:</Text> No data loss; quickest option.</Paragraph>
        <Paragraph><Text strong>Cons:</Text> Some models will struggle with extreme values.</Paragraph>
      </>
    ),
  },
  {
    value: 'standardize',
    title: 'Standardize',
    description: (
      <>
        <Paragraph><Text strong>What it does:</Text> Applies z-score scaling assuming no outliers remain.</Paragraph>
        <Paragraph><Text strong>Pros:</Text> Centers features. Good default for many models.</Paragraph>
        <Paragraph><Text strong>Cons:</Text> Unbounded result.</Paragraph>
      </>
    ),
  },
  {
    value: 'normalize',
    title: 'Normalize',
    description: (
      <>
        <Paragraph><Text strong>What it does:</Text> Scales features into [0,1] range.</Paragraph>
        <Paragraph><Text strong>Pros:</Text> Ideal for Neural Networks & distance based methods.</Paragraph>
        <Paragraph><Text strong>Cons:</Text> Future outliers force re-scaling. Hides distance from mean.</Paragraph>
      </>
    ),
  },
];

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
        datasetSummary,
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
    const [valueForActions, setValueForActions] = useState(1);

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

            {datasetSummary && datasetSummary.recommendations.length > 0 && (
            <div className='flex flex-col gap-4 w-full my-4 items-center justify-center border'>
                <Space direction="vertical">
                    <Radio.Group
                        onChange={e => setValueForActions(e.target.value)}
                        value={valueForActions}
                    >
                        <Space direction="vertical">
                        {choices.map(opt => (
                            <Popover
                            key={opt.value}
                            title={opt.title}
                            content={opt.description}
                            placement="rightTop"
                            >
                            <Radio.Button value={opt.value}>
                                {opt.title}
                            </Radio.Button>
                            </Popover>
                        ))}
                        </Space>
                    </Radio.Group>
                </Space>
            </div>
            )}
            
            <div className='flex flex-row justify-items-stretch gap-4'>
                <Button block type="primary" onClick={onBack}>Back</Button>
                <Button block type="primary" onClick={onImport}>Import</Button>
                <Button block type="primary" onClick={onNext}>Next</Button>
            </div>
        </div>
    );
}