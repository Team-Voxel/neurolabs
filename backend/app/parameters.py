import platformdirs as pdr
import pathlib as pl
import json
import pickle


# global data directory
DATA_DIR = pdr.user_documents_dir() + '/neurolabs'
DATA_DIR_PATH = pl.Path(DATA_DIR)

# global working directory
WORKING_DIR_PATH = DATA_DIR_PATH

pl.Path(DATA_DIR).mkdir(parents=True, exist_ok=True)

def get_wkd_path() -> pl.Path:
    return WORKING_DIR_PATH

def create_problem(problem_name : str) -> pl.Path:
    global WORKING_DIR_PATH
    global GLOBAL_PROBLEM_INDEX

    pl.Path(DATA_DIR + f'/{problem_name}').mkdir(parents=True, exist_ok=True)
    if problem_name in GLOBAL_PROBLEM_INDEX["names"]:
        WORKING_DIR_PATH = DATA_DIR_PATH / problem_name
        return WORKING_DIR_PATH
    
    GLOBAL_PROBLEM_INDEX["count"] += 1
    GLOBAL_PROBLEM_INDEX["names"].append(problem_name)
    WORKING_DIR_PATH = DATA_DIR_PATH / problem_name
    return WORKING_DIR_PATH

def set_problem(problem_name : str) -> pl.Path:
    global WORKING_DIR_PATH
    global GLOBAL_PROBLEM_INDEX

    if problem_name in GLOBAL_PROBLEM_INDEX["names"]:
        WORKING_DIR_PATH = DATA_DIR_PATH / problem_name
        return WORKING_DIR_PATH
    return None

def make_problem_index() -> dict[str, any]:
    if pl.Path(DATA_DIR_PATH / 'data.json').exists():
        loaded_data = {}
        with open(DATA_DIR_PATH / 'data.json', 'r') as f:
            loaded_data = json.load(f)
        return loaded_data
    
    data = {
        "count" : 0,
        "names" : []
    }
    
    with open(DATA_DIR_PATH / 'data.json', 'w') as f:
        json.dump(data, f, indent=4)
    
    return data

def save_problem_index() -> None:
    global WORKING_DIR_PATH
    global GLOBAL_PROBLEM_INDEX

    with open(DATA_DIR_PATH / 'data.json', 'w') as f:
        json.dump(GLOBAL_PROBLEM_INDEX, f, indent=4)

GLOBAL_PROBLEM_INDEX : dict[str, any] = make_problem_index()
GLOBAL_PREDICTION_VECTOR : str

