import React, { useState } from 'react';
import { Modal, Button, Select, message, Segmented, Form, Typography } from 'antd';
import { ModelTrainingInfo } from '../../backend_api/types';
import { SegmentedLabeledOption } from 'antd/es/segmented';
import ReactPlayer from 'react-player';
// Import videos
import LogisticVideo from '../../assets/videos/Logistic.mp4';
import SVMVideo from '../../assets/videos/SVM.mp4';

interface ModelModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (model: string) => void;
}

const ModelModal: React.FC<ModelModalProps> = ({ visible, onClose, onSelect }) => {
    const [form] = Form.useForm();
    const [selectedModel, setSelectedModel] = useState<string>('logistic');
    const [isVideoReady, setIsVideoReady] = useState(false);

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
            label: 'Gradient Boosting',
            value: 'boost',
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
            width={1000}
        >
            <div className="flex flex-row items-center justify-center h-full w-full gap-4">
                <div className="flex-1 h-full w-1/3">
                    <Segmented  options={options} onChange={(value) => setSelectedModel(value.toString())} value={selectedModel} vertical block size='large'/>
                </div>
                <div className="flex flex-col items-center justify-center h-full w-2/3 gap-4">
                    <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden h-1/2">  
                        <ReactPlayer
                            url={selectedModel === 'logistic' ? LogisticVideo : SVMVideo}
                            playing={true}
                            loop={true}
                            width="100%"
                            height="100%"
                            onReady={() => setIsVideoReady(true)}
                            onError={(e) => {
                                console.error('Video playback error:', e);
                                message.error('Failed to load video');
                            }}
                            config={{
                                file: {
                                    attributes: {
                                        controlsList: 'nodownload',
                                        disablePictureInPicture: true,
                                        controls: false,
                                    }
                                }
                            }}
                        />
                    </div>
                    <div className="w-full h-1/2">
                        {/* Show a description of the selected model */}
                        <Typography.Text>
                            {selectedModel === 'logistic' 
                                ? 'Logistic Regression is used for classification problems, predicting categorical outcomes.'
                                : 'Support Vector Machine (SVM) is a powerful classifier that finds the optimal hyperplane to separate classes.'}
                        </Typography.Text>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ModelModal;




