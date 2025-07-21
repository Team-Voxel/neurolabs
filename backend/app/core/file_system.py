import platformdirs as pdr
import pathlib as pl
import json
import pickle
import shutil
from .context import Context



'''
Directory Structure

dd = data directory (mydocs/neurolabs)
pwd = project working directory (mydocs/neurolabs/project_name)

dd 
|_ project_index.json
|_ pwd
    |_ project_data.json
    |_ original_data.csv
    |_ processed_data.csv
    |_ analysis_report.json
    |_ model_name.pkl

'''


# global data directory
DATA_DIR = pdr.user_documents_dir() + '/neurolabs'
DATA_DIR_PATH = pl.Path(DATA_DIR)
pl.Path(DATA_DIR).mkdir(parents=True, exist_ok=True)
project_list = []


def get_pwd(problem_name : str) -> pl.Path:
    return pl.Path(DATA_DIR + f'/{problem_name}')

def get_proj_index_path(problem_name : str) -> pl.Path:
    return pl.Path(get_pwd(problem_name) / "project_data.json")

def copy_file(src_path: str, dest_path: str):
    """Copies a file from src_path to dest_path."""

    src = pl.Path(src_path)
    dest = pl.Path(dest_path)

    if not src.is_file():
        raise FileNotFoundError(f"Source file '{src}' does not exist")

    dest.parent.mkdir(parents=True, exist_ok=True)

    shutil.copy2(src, dest)


def save_index_as_json(data : dict[str, any], project_name : str):
    """
    Save the index as a JSON file.
    """
    with open(get_proj_index_path(project_name), 'w') as f:
        json.dump(data, f, indent=4)


def load_index_file(project_name : str) -> dict[str, any]:
    """
    Load a index file
    """
    with open(get_proj_index_path(project_name), 'r') as f:
        data = json.load(f)
    return data


def initialize_data_dir() -> None:
    """
    Initialize the data directory.
    """
    global project_list
    pl.Path(DATA_DIR).mkdir(parents=True, exist_ok=True)
    index_path = pl.Path(DATA_DIR + '/project_index.pkl')

    if not index_path.exists():
        # Create an empty index file if it doesn't exist
        save_list_pickle(index_path, [])
        return None

    load_disk_data = load_list_pickle(index_path)
    if not load_disk_data:
        # If the index file is empty, create an empty list
        project_list = []
        return None
    project_list = load_disk_data["projects"]
    return None


def get_all_projects() -> list[str]:
    """
    Get all projects in the data directory.
    """
    return project_list


def save_list_pickle(file_path: str, data: list):
    pl.Path(file_path).parent.mkdir(parents=True, exist_ok=True)
    with open(file_path, "wb") as f:
        pickle.dump(data, f)

def load_list_pickle(file_path: str) -> list:
    with open(file_path, "rb") as f:
        return pickle.load(f)


def get_csv_headers(file_path : str) -> list[str]:
    """
    Get headers from a CSV file.
    Assumes the first row contains headers.
    """
    with open(file_path, 'r') as f:
        headers = f.readline().strip().split(',')
    return headers


def create_project_files(problem_name : str, data_path : str, problem_type : str, prediction_type : str) -> pl.Path:
    path = get_pwd(problem_name)
    path.mkdir(parents=True, exist_ok=True)
    data = {
        'name' : problem_name,
        'data_path' : data_path,
        'df_name' : pl.Path(data_path).stem,
        'probtype' : problem_type,
        'predtype' : prediction_type,
        'models' : []
    }
    save_index_as_json(data, problem_name)
    copy_file(data_path, path / 'original_data.csv')
    project_list.append(problem_name)
    save_list_pickle(DATA_DIR + '/project_index.pkl', project_list)
    return path