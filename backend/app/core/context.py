from .file_system import *

class Context:
    """
    Context class to manage the state of the application.
    """
    project_name : str
    project_type : str
    
    def __init__(self):
        self.state = {}

    

    def initialize():
        pass
        


def load_context(problem_name : str) -> Context:
    """
    create a new context with given project parameters if the problem exists
    """
    context = Context()
    proj_index = load_index_file(problem_name)
    if proj_index is None:
        raise ValueError(f"Project {problem_name} does not exist.")
    context.project_name = problem_name
    context.project_type = proj_index["prob_type"]
    context.project_type = proj_index["pred_type"]
    context.project_type = proj_index["data_path"]
    context.initialize()
    pass