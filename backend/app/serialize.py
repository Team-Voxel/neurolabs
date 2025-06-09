import os
import joblib
import torch
import json
from datetime import datetime
from sklearn.base import BaseEstimator
from torchmlp import _BaseMLP



def save_model(model, model_name: str, metadata_dict: dict, save_dir: str, metrics: dict, hyperparameters: dict) -> dict:
    """
    Saves a PyTorch or scikit-learn model to disk and updates a metadata dictionary.

    Args:
        model: The trained model object (custom PyTorch or scikit-learn).
        model_name (str): A unique name to identify the model.
        metadata_dict (dict): The dictionary containing metadata of all models.
        save_dir (str): The directory where the model file will be saved.
        metrics (dict): A dictionary of performance metrics (e.g., {'accuracy': 0.95}).

    Returns:
        dict: The updated metadata dictionary.
    """
    # Ensure the save directory exists
    os.makedirs(save_dir, exist_ok=True)

    # Determine model type and set file extension and saver
    if isinstance(model, _BaseMLP):
        model_type = 'pytorch'
        file_extension = 'pth'
        saver = torch.save
        lib = 'torch'
    elif isinstance(model, BaseEstimator):
        model_type = 'sklearn'
        file_extension = 'joblib'
        saver = joblib.dump
        lib = 'sklearn'
    else:
        lib = 'unknown'
        raise TypeError(f"Unsupported model type: {type(model)}. "
                        "This function supports custom PyTorch MLPs and scikit-learn estimators.")

    # Construct the full path for the model file
    file_path = os.path.join(save_dir, f"{model_name}.{file_extension}")

    # Save the model to the specified path
    saver(model, file_path)
    print(f"Model '{model_name}' saved to '{file_path}'")

    # Create the metadata entry
    model_metadata = {
        'name': model_name,
        'type': model_type,
        'hyperparameters': hyperparameters,
        'path': file_path,
        'metrics': metrics,
        'dateTrained': datetime.now().isoformat(),
        'lib': lib
    }

    # Add the new metadata to the main dictionary
    metadata_dict[model_name] = model_metadata
    
    return metadata_dict


def load_model(model_name: str, metadata_dict: dict):
    """
    Loads a model from disk using its name and a metadata dictionary.

    Args:
        model_name (str): The name of the model to load.
        metadata_dict (dict): The dictionary containing the model's metadata.

    Returns:
        The loaded model object.
    """
    if model_name not in metadata_dict:
        raise KeyError(f"Model '{model_name}' not found in the metadata dictionary.")

    entry = metadata_dict[model_name]
    model_path = entry['path']
    lib = entry['lib']

    print(f"Loading model '{model_name}' from '{model_path}'...")

    # Load the model based on its type
    if lib == 'torch':
        model = torch.load(model_path)
    elif lib == 'sklearn':
        model = joblib.load(model_path)
    else:
        raise ValueError(f"Unknown model type '{lib}' in metadata for model '{model_name}'.")

    return model



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
