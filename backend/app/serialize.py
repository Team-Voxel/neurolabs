import os
import joblib
import torch
import json
from datetime import datetime
from sklearn.base import BaseEstimator
from torchmlp import _BaseMLP
from typing import Union, Dict, Any
from models import ModelConfig, ModelFactory


def save_model(
        model: Union[_BaseMLP, BaseEstimator], 
        config: ModelConfig, 
        model_type: str, 
        metadata_dict: dict, 
        save_dir: str, 
        baseMetric: str, 
        hyperparameters: dict) -> dict:
    """
    Saves a PyTorch or scikit-learn model to disk and updates a metadata dictionary.

    Args:
        model: The trained model object (custom PyTorch or scikit-learn).
        model_name (str): A unique name to identify the model.
        metadata_dict (dict): The dictionary containing metadata of all models.
        save_dir (str): The directory where the model file will be saved.
        baseMetric (dict): A dictionary of performance metrics (e.g., {'accuracy': 0.95}).

    Returns:
        dict: The updated metadata dictionary.
    """
    # Ensure the save directory exists
    os.makedirs(save_dir, exist_ok=True)

    # Determine model type and set file extension and saver
    if isinstance(model, _BaseMLP):
        file_extension = 'pth'
        saver = torch.save
        lib = 'torch'
    elif isinstance(model, BaseEstimator):
        file_extension = 'joblib'
        saver = joblib.dump
        lib = 'sklearn'
    else:
        lib = 'unknown'
        raise TypeError(f"Unsupported model type: {type(model)}. "
                        "This function supports custom PyTorch MLPs and scikit-learn estimators.")

    # Construct the full path for the model file
    file_path = os.path.join(save_dir, f"{model_type}.{file_extension}")
    config_path = os.path.join(save_dir, 'config.joblib')

    # Save the model to the specified path
    if lib == 'torch':
        saver(model.get_state_dict(), file_path)
    else:
        saver(model, file_path)


    joblib.dump(config, config_path)

    print(f"Model '{model_type}' saved to '{file_path}'")

    snapshot = {
        'hyperParameters': hyperparameters,
        'date': datetime.now().isoformat(),
        'baseMetric': baseMetric
    }

    if model_type in metadata_dict.keys():
        metadata_dict[model_type]['snapshots'].append(snapshot)
    else:
        metadata_dict[model_type] = {
            'modelType': model_type,
            'path': file_path,
            'config': config_path,
            'lib': lib,
            'snapshots': [snapshot]
        }

    # Add the new metadata to the main dictionary
    # Structure
    # metadata_dict => Dict[model_type, model_details]
    # model_details => (model_type, path, config, lib, snapshots[])
    # snapshot => (hyperparameters, date, base_metric)
    
    return metadata_dict


def load_model(model_type: str, metadata_dict: dict) -> tuple[Union[_BaseMLP, BaseEstimator], ModelConfig]:
    """
    Loads a model from disk using its name and a metadata dictionary.

    Args:
        model_name (str): The name of the model to load.
        metadata_dict (dict): The dictionary containing the model's metadata.

    Returns:
        The loaded model object.
    """
    if model_type not in metadata_dict:
        raise KeyError(f"Model '{model_type}' not found in the metadata dictionary.")

    entry = metadata_dict[model_type]
    model_path = entry['path']
    config_path = entry['config']
    lib = entry['lib']

    print(f"Loading model '{model_type}' from '{model_path}'...")
    config : ModelConfig = joblib.load(config_path)

    # Load the model based on its type
    if lib == 'torch':
        state_dict = torch.load(model_path)
        model : _BaseMLP = ModelFactory._create_neural_network(config)
        model.load_state_dict(state_dict)
    elif lib == 'sklearn':
        model : BaseEstimator = joblib.load(model_path)
    else:
        raise ValueError(f"Unknown model base type '{lib}' in metadata for model '{model_type}'.")

    return model, config    



def load_metadata_object(data_dir: str) -> dict:

    # Check if the metadata file exists (metadata.json)
    metadata_path = os.path.join(data_dir, 'metadata.json')
    if not os.path.exists(metadata_path):
        # If not found, create a new metadata object
        metadata_dict = {}
        with open(metadata_path, 'w') as f:
            json.dump(metadata_dict, f)
    else:
        with open(metadata_path, 'r') as f:
            metadata_dict = json.load(f)

    return metadata_dict


def save_metadata_object(metadata_dict: dict, data_dir: str) -> None:
    metadata_path = os.path.join(data_dir, 'metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata_dict, f)


def save_model_training_data(model_type: str, data: dict, data_dir: str) -> None:
    """
    Saves model training data to a JSON file.

    Args:
        model_type (str): The type of the model.
        data (dict): The training data to save.
        data_dir (str): The directory where the data will be saved.
    """
    file_path = os.path.join(data_dir, f"{model_type}_data.json")
    with open(file_path, 'w') as f:
        json.dump(data, f)