import React, { useState } from 'react';
import { Modal, Button, Select, message, Segmented, Form, Typography } from 'antd';
import { ModelTrainingInfo } from '../../backend_api/types';
import { SegmentedLabeledOption } from 'antd/es/segmented';

interface ModelModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (model: string) => void;
}

const ModelModal: React.FC<ModelModalProps> = ({ visible, onClose, onSelect }) => {
    const [form] = Form.useForm();
    const [selectedModel, setSelectedModel] = useState<string>('Linear Regression');

    const options : SegmentedLabeledOption[] = [
        {
            label: 'Logistic Regression',
            value: 'logistic',
        },
        {
            label: 'Support Vector Machine',
            value: 'svm',
        },
        {
            label: 'Decision Tree',
            value: 'tree',
        },
        {
            label: 'Random Forest',
            value: 'forest',
        },
        {
            label: 'K-Nearest Neighbors',
            value: 'knn',
        },
        {
            label: 'Neural Network',
            value: 'nn',
        },
    ];
    const handleOk = () => {
        form.validateFields().then((values) => {
            onSelect(selectedModel);
            onClose();
        });
    };

    return (
        <Modal
            title="Select Model"
            open={visible}
            onOk={handleOk}
            onCancel={onClose}
        >
            <div className="flex flex-row items-center justify-center h-full w-full">
                <div className="flex flex-col items-center justify-center h-full w-1/3">
                    <Segmented options={options} onChange={(value) => setSelectedModel(value.toString())} value={selectedModel} vertical/>
                </div>
                <div className="flex flex-col items-center justify-center h-full w-2/3">
                    <div>
                    {/* Show an animation of the selected model */}
                    </div>
                    <div>
                    {/* Show a description of the selected model */}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ModelModal;




