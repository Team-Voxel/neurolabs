import React, {useEffect, useState} from "react";
import { Button, Typography, Modal, Divider, Select, Checkbox} from 'antd'
import { CheckCircleOutlined, ExclamationCircleOutlined, CloseOutlined } from '@ant-design/icons'

export interface PreprocessModalProps {
    issues: string[];
    open: boolean;
    onClose: () => void;
    onOk: (missingImputation: string, outlierDetection: boolean, featureScaling: string) => void
}

export const PreprocessModal: React.FC<PreprocessModalProps> = ({issues , open, onClose, onOk}) => {
    const [missingImputation, setMissingImputation] = useState<string>("mean");
    const [outlierDetection, setOutlierDetection] = useState<boolean>(false);
    const [featureScaling, setFeatureScaling] = useState<string>("none");
    const [issueCheck, setIssueCheck] = useState<string[]>([]);

    useEffect(() => {
        setMissingImputation(issueCheck.includes("missing") ? "mean" : "none");
        setOutlierDetection(issueCheck.includes("outlier") ? true : false);
        setFeatureScaling(issueCheck.includes("scale") ? "standardize" : "none");
        
        issues.forEach((issue) => {
            if (issue.includes("missing")) {
                setIssueCheck(prev => [...prev, "missing"]);
            }
            else if (issue.includes("outlier")) {
                setIssueCheck(prev => [...prev, "outlier"]);
            }
            else if (issue.includes("scale") || issue.includes("range")) {
                setIssueCheck(prev => [...prev, "scale"]);
            }
        });
    }, [open]);

    const handleOk = () => {
        onOk(missingImputation, outlierDetection, featureScaling);
    }

    return (
        <Modal open={open} onCancel={onClose} onOk={handleOk}>
            <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2">
                <CloseOutlined className="text-red-500" onClick={onClose} />
                <Typography.Text>{issues.length} issues found</Typography.Text>
                </div>
                {
                    issues.map((issue, idx) => (
                        <div key={idx} className="flex flex-row gap-2">
                            <ExclamationCircleOutlined className="text-red-500" />
                            <Typography.Text>{issue}</Typography.Text>
                        </div>
                    ))
                }
                <Divider />
                {issueCheck.includes("missing") && <div className="flex flex-row gap-2 justify-between">
                    <Typography.Text>Impute Missing Values</Typography.Text>
                    <div className="w-48">
                    <Select options={[{"label": "Mean", "value": "mean"}, {"label": "Median", "value": "median"}, {"label": "Mode", "value": "mode"}]} value={missingImputation} onChange={(value) => setMissingImputation(value)} />
                    </div>
                </div>}
                {issueCheck.includes("outlier") && <div className="flex flex-row gap-2 justify-between">
                    <Typography.Text>Remove Outliers</Typography.Text>
                    <Checkbox checked={outlierDetection} onChange={(e) => setOutlierDetection(e.target.checked)} />
                </div>}
                {issueCheck.includes("scale") && <div className="flex flex-row gap-2 justify-start">
                    <Typography.Text>Scale Features</Typography.Text>
                    <div className="w-48">
                    <Select options={[{"label": "Standardize", "value": "standardize"}, {"label": "Normalize", "value": "normalize"}]} value={featureScaling} onChange={(value) => setFeatureScaling(value)} />
                    </div>
                </div>}
            </div>
        </Modal>
    )
}