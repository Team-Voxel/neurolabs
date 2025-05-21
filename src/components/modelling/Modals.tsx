import { Modal, Button, Input, Tooltip, Typography } from "antd";
import {ModelType, UserModel} from "../../AppState";
import { useState } from "react";

interface SelectableCardProps {
    imageUrl: string;
    label: string;
    value: ModelType;
    selectedKey: ModelType;
    description?: string;
    onSelect: (value: ModelType) => void;
  }

export interface ModelInfo {
    name: string;
    type: ModelType;
    description: string;
    imageUrl: string;
    value: string;
}
  
function cx(...classes: (string | false | null | undefined)[]) { return classes.filter(Boolean).join(" ");}

const SelectableCard: React.FC<SelectableCardProps> = ({
    imageUrl,
    label,
    value,
    selectedKey,
    onSelect,
    description,
  }) => {
    const isSelected = value === selectedKey;
  
    return (
        description ? <Tooltip title={description} placement="top" mouseEnterDelay={1}>
      <div
        className={cx(
          'relative rounded-lg overflow-hidden cursor-pointer border transition-all duration-200',
            isSelected ? 'border-blue-500 ring-2 ring-blue-400':
            'border-gray-300 hover:ring-1 hover:ring-gray-400'
        )}
        onClick={() => onSelect(value)}
      >
        <img src={imageUrl} alt={label} className="w-full h-32 w-40 object-cover" />
        <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center">
          <span className="text-gray-800 font-semibold text-lg text-center px-2">
            {label}
          </span>
        </div>
      </div>
      </Tooltip> : 
      <div
      className={cx(
        'relative rounded-lg overflow-hidden cursor-pointer border transition-all duration-200',
          isSelected ? 'border-blue-500 ring-2 ring-blue-400':
          'border-gray-300 hover:ring-1 hover:ring-gray-400'
      )}
      onClick={() => onSelect(value)}
    >
      <img src={imageUrl} alt={label} className="w-full h-32 w-40 object-cover" />
      <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center">
        <span className="text-gray-800 font-semibold text-lg text-center px-2">
          {label}
        </span>
      </div>
    </div>
    );
};

const RegressionModels : ModelInfo[] = [
{
    name: "Linear Regression",
    type: ModelType.LINEAR_REG,
    description: "A linear approach to modeling the relationship between a scalar response and one or more explanatory variables.",
    imageUrl: "",
    value: "linr"
},
{
    name: "Non Linear Regression",
    type: ModelType.NONL_REG,
    description: "A non-linear approach to modeling the relationship between a scalar response and one or more explanatory variables.",
    imageUrl: "",
    value: "nonlinr"
},
{
    name: "Support Vector Regression",
    type: ModelType.SV_REG,
    description: "A support vector machine approach to regression, \
    which aims to find a function that deviates from the actual observed \
    values by a value no greater than a specified margin.",
    imageUrl: "",
    value: "svr"
},
{
    name: "Nearest Neighbors Regression",
    type: ModelType.NN_REG,
    description: "A regression method that predicts the value of a target variable \
    based on the values of its nearest neighbors in the feature space.",
    imageUrl: "",
    value: "nnr"
},
{
    name: "SGD Regression",
    type: ModelType.SGD_REG,
    description: "A linear regression model that uses stochastic gradient descent to optimize the loss function.",
    imageUrl: "",
    value: "sgdr"
},
{
    name: "Decision Tree Regression",
    type: ModelType.DT_REG,
    description: "A decision tree-based approach to regression, which splits the data into subsets based on feature values.",
    imageUrl: "",
    value: "dtr"
},
{
    name: "Random Forest Regression",
    type: ModelType.RF_REG,
    description: "An ensemble method that uses multiple decision trees to improve the accuracy of regression predictions.",
    imageUrl: "",
    value: "rfr"
},
{
    name: "Gradient Boosting Regression",
    type: ModelType.GB_REG,
    description: "An ensemble method that builds models sequentially, each trying to correct the errors of the previous one.",
    imageUrl: "",
    value: "gbr"
},
{
    name: "Deep Neural Network",
    type: ModelType.DNN,
    description: "A deep learning approach to regression, which uses multiple layers of neurons to learn complex patterns in the data.",
    imageUrl: "",
    value: "dnnr"
}
]

const ClassificationModels : ModelInfo[] = [
{
    name: "Logistic Regression",
    type: ModelType.LOGS_CLASS,
    description: "A linear approach to classification that models the probability\
     of a multiple class outcome based on one or more predictor variables.",
    imageUrl: "",
    value: "logr"
},
{
    name: "Support Vector Classification",
    type: ModelType.SV_CLASS,
    description: "A support vector machine approach to classification, which aims to find a hyperplane that separates the classes.",
    imageUrl: "",
    value: "svc"
},
{
    name: "Nearest Neighbors Classification",
    type: ModelType.NN_CLASS,
    description: "A classification method that predicts the class of a target variable based on the classes of its nearest neighbors.",
    imageUrl: "",
    value: "nnc"
},
{
    name: "SGD Classification",
    type: ModelType.SGD_CLASS,
    description: "A linear classification model that uses stochastic gradient descent to optimize the loss function.",
    imageUrl: "",
    value: "sgdc"
},
{
    name: "Decision Tree Classification",
    type: ModelType.DT_CLASS,
    description: "A decision tree-based approach to classification, which splits the data into subsets based on feature values.",
    imageUrl: "",
    value: "dtc"
},
{
    name: "Random Forest Classification",
    type: ModelType.RF_CLASS,
    description: "An ensemble method that uses multiple decision trees to improve the accuracy of classification predictions.",
    imageUrl: "",
    value: "rfc"
},
{
    name: "Gradient Boosting Classification",
    type: ModelType.GB_CLASS,
    description: "An ensemble method that builds models sequentially, each trying to correct the errors of the previous one.",
    imageUrl: "",
    value: "gbc"
},
{
    name: "Deep Neural Network",
    type: ModelType.DNN,
    description: "A deep learning approach to classification, which uses multiple layers of neurons to learn complex patterns in the data.",
    imageUrl: "",
    value: "dnnc"
},
]

interface AddNewModelProps {
    open : boolean;
    type : 'reg' | 'class';
    onCancel: () => void;
    onConfirm: (model: ModelType, name : string) => void;
}

export const AddNewModel : React.FC<AddNewModelProps> = ({open, type, onCancel, onConfirm}) => {
    const [selected, setSelected] = useState<ModelType>(type === 'reg' ? ModelType.LINEAR_REG : ModelType.LOGS_CLASS);
    const [name, setName] = useState<string>('');
    const onSelect = (value: ModelType) => {
        setSelected(value);
    }
    const confirmValidation = (model: ModelType, name : string) => {
        if (name.trim() === '') {
            alert('Please enter a name for the model');
            return false;
        }
        if (type === 'reg' && !RegressionModels.some(model => model.type === selected)) {
            alert('Please select a regression model');
            return false;
        }
        if (type === 'class' && !ClassificationModels.some(model => model.type === selected)) {
            alert('Please select a classification model');
            return false;
        }
        onConfirm(model, name);
    }

    return (
        <Modal 
            open={open} 
            onCancel={onCancel} 
            onClose={onCancel}
            closeIcon={false}
            width={800}
            footer={[
                <Button key="back" onClick={onCancel}>
                  Return
                </Button>,
                <Button key="confirm" type="primary" onClick={() => confirmValidation(selected ? selected : ModelType.LINEAR_REG, name)}>
                  Confirm
                </Button>,
              ]}
        >
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <Typography.Title level={3} className="text-center">Add New Model</Typography.Title>
                <Input placeholder= "Enter a name" value={name} onChange={(e) => setName(e.target.value)}/>
                <div className="grid grid-cols-4 gap-4">
                    {type === 'reg' ? RegressionModels.map((model) => (
                        <SelectableCard
                            key={model.value}
                            imageUrl={model.imageUrl}
                            label={model.name}
                            value={model.type}
                            selectedKey={selected}
                            onSelect={onSelect}
                            description={model.description}
                        />
                    )) : ClassificationModels.map((model) => (
                        <SelectableCard
                            key={model.value}
                            imageUrl={model.imageUrl}
                            label={model.name}
                            value={model.type}
                            selectedKey={selected}
                            onSelect={onSelect}
                            description={model.description}
                        />
                    ))}
                </div>
            </div>
        </Modal>
    )
}

interface OpenModelProps {
    models: UserModel[];
    open : boolean;
    onCancel: () => void;
    onConfirm: (model: UserModel) => void;
}

export const OpenModelModal : React.FC<OpenModelProps> = ({models, open, onCancel, onConfirm}) => {
    const [selected, setSelected] = useState<number>(0);
    const onSelect = (value: number) => {
        setSelected(value);
    }
    const imageUrls = models.map((model) => {
        const match = RegressionModels.find(el => el.type === model.type) || ClassificationModels.find(el => el.type === model.type);
        return match?.imageUrl;
      });

    return (
        <Modal 
            open={open} 
            onCancel={onCancel} 
            onClose={onCancel}
            closeIcon={false}
            width={500}
            footer={[
                <Button key="back" onClick={onCancel}>
                  Return
                </Button>,
                <Button key="confirm" type="primary" onClick={() => onConfirm(models[selected])}>
                  Confirm
                </Button>,
              ]}
        >
            <div className="flex flex-col items-center justify-center h-full w-full gap-4">
                <Typography.Title level={3} className="text-center">Load a Model</Typography.Title>
                {models.length !== 0 ? (
                    <div className="grid grid-cols-4 gap-4">
                        {models.map((model, idx) => (
                        <SelectableCard
                            key={model.name}
                            imageUrl={imageUrls![idx]!}
                            label={model.name}
                            value={idx}
                            selectedKey={selected}
                            onSelect={onSelect}
                        />
                        ))}
                    </div>
                    ) : (
                    <div className="flex flex-col items-center justify-center mb-4 h-full w-full border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <Typography.Title level={5} className="text-center">No models available</Typography.Title>
                        <p className="text-gray-500">Please create a model to load.</p>
                    </div>
                    )}
                </div>
        </Modal>
    );
}