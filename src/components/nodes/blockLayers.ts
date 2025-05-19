
// compatible means what type of nodes can come after this node
// layer_type means what type of node this is, for example, DNN, Input, Terminal, etc.
// layer_id is the id of the node, it is used to identify the node in the graph
// name is the name of the node, it is used to display the node in the graph
// controls specify the controls shown to the user

type NumberControl = {
    name: string;
    type: 'number';
    default: number | null;
    min: number;
    max: number;
    step: number;
};

type SelectControl = {
name: string;
type: 'select';
options: string[];
default: string;
};

type TextControl = {
name: string;
type: 'text';
default: string;
};

export type LayerControl = NumberControl | SelectControl | TextControl;

export type LayerDefinition = {
    layer_id: string;
    layer_type: string; // could make this a union like 'DNN' | 'Regression' if needed
    name: string;
    description: string;
    compatible: string[];
    controls?: {
      [key: string]: LayerControl;
    };
};

export const layerTypes : LayerDefinition[] = [
    {
      layer_id: '1',
      layer_type: 'DNN',
      name : 'Convolutional',
      description: 'Convolutional Layer',
      compatible: ['DNN'],
      controls: {
        kernel_size: {
            name: 'Kernel Size',
            type: 'number',
            default: 3,
            min: 1,
            max: 32,
            step: 1,
        },
        out_channels: {
            name: 'Filters',
            type: 'number',
            default: 64,
            min: 1,
            max: 32,
            step: 1,
        },
        activation_function: {
            name: 'Activation Function',
            type: 'select',
            options: ['None', 'ReLU', 'Sigmoid', 'Tanh'],
            default: 'ReLU',
        },
      }
    },
    {
        layer_id: '3',
        layer_type: 'DNN',
        name : 'Pooling',
        description: 'Pooling Layer',
        compatible: ['DNN'],
        controls: {
            type : {
                name : 'Type',
                type: 'select',
                options: ['Max', 'Average'],
                default: 'Max',
            },
            kernel_size: {
                name: 'Kernel Size',
                type: 'number',
                default: 2,
                min: 1,
                max: 32,
                step: 1,
            },
        }
    },
    {
        layer_id: '4',
        layer_type: 'DNN',
        name : 'Activation',
        description: 'Activation Layer',
        compatible: ['Input', 'DNN', 'Classical', 'Terminal'],
        controls: {
            activation_function: {
                name: 'Activation Function',    
                type: 'select',
                options: ['None', 'ReLU', 'Sigmoid', 'Tanh'],
                default: 'ReLU',
            },
        }
    },
    {
        layer_id: '5',
        layer_type: 'DNN',
        name : 'Dense',
        description: 'Dense Layer',
        compatible: ['DNN', 'Classical', 'Terminal'],
        controls: {
            units: {
                name: 'Neurons',
                type: 'number',
                default: 128,
                min: 1,
                max: 1024,
                step: 1,
            },
            activation_function: {
                name: 'Activation Function',    
                type: 'select',
                options: ['None', 'ReLU', 'Sigmoid', 'Tanh'],
                default: 'ReLU',
            },
        }
    },
    {
        layer_id: '6',
        layer_type: 'DNN',
        name : 'Dropout',
        description: 'Dropout Layer',
        compatible: ['DNN'],
        controls: {
            rate: {
                name: 'Dropout Rate',
                type: 'number',
                default: 0.5,
                min: 0,
                max: 1,
                step: 0.01,
            },
        }
    },
    {
        layer_id: '9',
        layer_type: 'DNN',
        name : 'BatchNorm',
        description: 'Batch Normalization Layer',
        compatible: ['DNN'],
    },
    {
        layer_id: '10',
        layer_type: 'DNN',
        name : 'Flatten',
        description: 'Flatten Layer',
        compatible: ['DNN', 'Classical', 'Terminal'],
    },
    {
        layer_id: '11',
        layer_type: 'Input',
        name : 'Dimensionality Reduction',
        description: 'Dimensionality Reduction Block',
        compatible: ['Input', 'DNN', 'Classical'],
        controls: {
            method: {
                name: 'Method',
                type: 'select',
                options: ['PCA', 't-SNE', 'UMAP'],
                default: 'PCA',
            },
            n_components: {
                name: 'Components',
                type: 'number',
                default: 2,
                min: 1,
                max: -1,
                step: 1,
            },
        }
    },
    {
        layer_id: '12',
        layer_type: 'Input',
        name : 'Feature Selection',
        description: 'Feature Selection Block',
        compatible: ['Input', 'DNN', 'Classical'],
        controls: {
            method: {
                name: 'Method',
                type: 'select',
                options: ['Filter', 'Wrapper', 'Embedded'],
                default: 'Filter',
            },
            n_features: {
                name: 'Features',
                type: 'number',
                default: 10,
                min: 1,
                max: -1,
                step: 1,
            },
        }
    },
    {
        layer_id: '13',
        layer_type: 'Input',
        name : 'Data Transformation',
        description: 'Data Augmentation Block',
        compatible: ['Input', 'DNN', 'Classical'],
        controls: {
            method: {
                name: 'Method',
                type: 'select',
                options: ['Normalize', 'Standardize', 'Log Transformation'],
                default: 'Normalize',
            },
            parameters: {
                name: 'Parameters',
                type: 'text',
                default: '{}',
            },
        }
    },
    // Classical
    {
        layer_id: '000',
        layer_type: 'Regression',
        name : 'Linear Regression (OLS)',
        description: 'Ordinary Least Squares Linear Regression',
        compatible: ['Terminal'],
    },
    {
        layer_id: '001',
        layer_type: 'Regression',
        name : 'Ridge Regression',
        description: 'Ridge Regression',
        compatible: ['Terminal'],
        controls: {
            alpha: {
                name: 'Regularization Strength',
                type: 'number',
                default: 1.0,
                min: 0,
                max: 10,
                step: 0.1,
            }
        }
    },
    {
        layer_id: '002',
        layer_type: 'Regression',
        name : 'Lasso Regression',
        description: 'Lasso Regression',
        compatible: ['Terminal'],
        controls: {
            alpha: {
                name: 'Regularization Strength',
                type: 'number',
                default: 1.0,
                min: 0,
                max: 10,
                step: 0.1,
            }
        }
    },
    {
        layer_id: '003',
        layer_type: 'Regression',
        name : 'ElasticNet Regression',
        description: 'ElasticNet Regression',
        compatible: ['Terminal'],
        controls: {
            alpha: {
                name: 'Regularization Strength',
                type: 'number',
                default: 1.0,
                min: 0,
                max: 10,
                step: 0.1,
            },
            l1_ratio: {
                name: 'L1 Ratio',
                type: 'number',
                default: 0.5,
                min: 0,
                max: 1,
                step: 0.01,
            }
        }
    },
    {
        layer_id: '004',
        layer_type: 'Regression',
        name : 'Polynomial Regression',
        description: 'Polynomial Regression',
        compatible: ['Terminal'],
        controls: {
            degree: {
                name: 'Polynomial Degree',
                type: 'number',
                default: 2,
                min: 1,
                max: 10,
                step: 1,
            }
        }
    },
    {
        layer_id: '005',
        layer_type: 'Regression',
        name : 'Support Vector Regression (SVR)',
        description: 'Support Vector Regression (SVR)',
        compatible: ['Terminal'],
        controls: {
            kernel: {
                name: 'Kernel',
                type: 'select',
                options: ['linear', 'poly', 'rbf', 'sigmoid'],
                default: 'rbf',
            },
            C: {
                name: 'Regularization Parameter',
                type: 'number',
                default: 1.0,
                min: 0,
                max: 10,
                step: 0.1,
            },
            epsilon: {
                name: 'Epsilon',
                type: 'number',
                default: 0.1,
                min: 0,
                max: 1,
                step: 0.01,
            }
        }
    },
    {
        layer_id: '006',
        layer_type: 'Regression',
        name : 'Decision Tree Regression',
        description: 'Decision Tree Regression',
        compatible: ['Terminal'],
        controls: {
            max_depth: {
                name: 'Max Depth',
                type: 'number',
                default: null,
                min: 1,
                max: 32,
                step: 1,
            },
            min_samples_split: {
                name: 'Min Samples Split',
                type: 'number',
                default: 2,
                min: 2,
                max: 32,
                step: 1,
            },
            min_samples_leaf: {
                name: 'Min Samples Leaf',
                type: 'number',
                default: 1,
                min: 1,
                max: 32,
                step: 1,
            }
        }
    },
    {
      layer_id: '007',
      layer_type: 'Regression',
      name : 'Random Forest Regression',
      description: 'Random Forest Regression',
      compatible: ['Terminal'],
        controls: {
            n_estimators: {
                name: 'Number of Trees',
                type: 'number',
                default: 100,
                min: 1,
                max: 1000,
                step: 1,
            },
            max_depth: {
                name: 'Max Depth',
                type: 'number',
                default: null,
                min: 1,
                max: 32,
                step: 1,
            },
            min_samples_split: {
                name: 'Min Samples Split',
                type: 'number',
                default: 2,
                min: 2,
                max: 32,
                step: 1,
            },
            min_samples_leaf: {
                name: 'Min Samples Leaf',
                type: 'number',
                default: 1,
                min: 1,
                max: 32,
                step: 1,
            }
        }
    },
    {
        layer_id: '008',
        layer_type: 'Regression',
        name : 'GLM Regression',
        description: 'Generalized Linear Model Regression',
        compatible: ['Terminal'],
        controls: {
            family: {
                name: 'Family',
                type: 'select',
                options: ['gaussian', 'poisson', 'binomial'],
                default: 'gaussian',
            },
            link: {
                name: 'Link Function',
                type: 'select',
                options: ['identity', 'log', 'logit'],
                default: 'identity',
            },
            alpha: {
                name: 'Regularization Strength',
                type: 'number',
                default: 1.0,
                min: 0,
                max: 10,
                step: 0.1,
            }
        },
    },
    {
        layer_id: '009',
        layer_type: 'Regression',
        name : 'KNN Regression',
        description: 'K-Nearest Neighbors Regression',
        compatible: ['Terminal'],
        controls: {
            n_neighbors: {
                name: 'Number of Neighbors',
                type: 'number',
                default: 5,
                min: 1,
                max: 32,
                step: 1,
            },
            weights: {
                name: 'Weights',
                type: 'select',
                options: ['uniform', 'distance'],
                default: 'uniform',
            }
        }
    },
    {
        layer_id: '010',
        layer_type: 'Classification',
        name : 'Logistic Regression',
        description: 'Logistic Regression',
        compatible: ['Terminal'],
        controls: {
            penalty: {
                name: 'Penalty',
                type: 'select',
                options: ['l1', 'l2', 'elasticnet', 'none'],
                default: 'l2',
            },
            C: {
                name: 'Inverse Regularization Strength',
                type: 'number',
                default: 1.0,
                min: 0,
                max: 10,
                step: 0.1,
            },
            solver: {
                name: 'Solver',
                type: 'select',
                options: ['liblinear', 'saga', 'newton-cg', 'lbfgs'],
                default: 'liblinear',
            }
        }
    },
    {
        layer_id: '011',
        layer_type: 'Classification',
        name : 'KNN Classification',
        description: 'K-Nearest Neighbors Classification',
        compatible: ['Terminal'],
        controls: {
            n_neighbors: {
                name: 'Number of Neighbors',
                type: 'number',
                default: 5,
                min: 1,
                max: 32,
                step: 1,
            },
            weights: {
                name: 'Weights',
                type: 'select',
                options: ['uniform', 'distance'],
                default: 'uniform',
            }
        }
    },
    {
        layer_id: '012',
        layer_type: 'Classification',
        name : 'Decision Tree Classification',
        description: 'Decision Tree Classification',
        compatible: ['Terminal'],
        controls: {
            max_depth: {
                name: 'Max Depth',
                type: 'number',
                default: null,
                min: 1,
                max: 32,
                step: 1,
            },
            min_samples_split: {
                name: 'Min Samples Split',
                type: 'number',
                default: 2,
                min: 2,
                max: 32,
                step: 1,
            },
            min_samples_leaf: {
                name: 'Min Samples Leaf',
                type: 'number',
                default: 1,
                min: 1,
                max: 32,
                step: 1,
            }
        }
    },
    {
        layer_id : '013',
        layer_type : 'Classification',
        name : 'Random Forest Classification',
        description : 'Random Forest Classification',
        compatible : ['Terminal'],
        controls : {
            n_estimators : {
              name : 'Number of Trees',
              type : 'number',
              default : 100,
              min : 1,
              max : 1000,
              step : 1,
            },
            max_depth : {
              name : 'Max Depth',
              type : 'number',
              default : null,
              min : 1,
              max : 32,
              step : 1,
            },
            min_samples_split : {
              name : 'Min Samples Split',
              type : 'number',
              default : 2,
              min : 2,
              max : 32,
              step : 1,
            },
            min_samples_leaf : {
              name : 'Min Samples Leaf',
              type : 'number',
                default : 1,
                min : 1,
                max : 32,
                step : 1,
            },
        }
    },
    {
        layer_id: '014',
        layer_type: 'Classification',
        name : 'Support Vector Classification (SVC)',
        description: 'Support Vector Classification (SVC)',
        compatible: ['Terminal'],
        controls: {
            kernel: {
                name: 'Kernel',
                type: 'select',
                options: ['linear', 'poly', 'rbf', 'sigmoid'],
                default: 'rbf',
            },
            C: {
                name: 'Regularization Parameter',
                type: 'number',
                default: 1.0,
                min: 0,
                max: 10,
                step: 0.1,
            },
            gamma: {
                name: 'Gamma',
                type: 'number',
                default: 1.0,
                min: 0,
                max: 10,
                step: 0.1,
            }
        }
    },
    {
        layer_id : '015',
        layer_type : 'Classification',
        name : 'Naive Bayes Classification',
        description : 'Naive Bayes Classification',
        compatible : ['Terminal'],
    },
];

export const layerMap: Record<string, LayerDefinition> = Object.fromEntries(
    layerTypes.map((layer) => [layer.layer_id, layer])
);


import { type MenuItem } from "../context_menu/types";

export const layerMenuItems: MenuItem[] = layerTypes.map((layer) => ({
    id: layer.layer_id,
    name: layer.name,
    icon_url: '../assets/reacts.svg',
    category: layer.layer_type,
}));