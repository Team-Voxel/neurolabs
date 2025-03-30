from .file_system import *

class Context:
    """
    Context class to manage the state of the application.
    """
    def __init__(self):
        self.state = {}

    def set(self, key, value):
        """
        Set a value in the context.
        """
        self.state[key] = value

    def get(self, key):
        """
        Get a value from the context.
        """
        return self.state.get(key)

    def clear(self):
        """
        Clear the context.
        """
        self.state.clear()
        


def load_context(problem_name : str) -> Context:
    """
    create a new context with given project parameters if the problem exists
    """
    context = Context()
    proj_index = load_index_file(problem_name)
    if proj_index is None:
        raise ValueError(f"Project {problem_name} does not exist.")
    context.set("problem_name", problem_name)
    context.set("prob_type", proj_index["prob_type"])
    context.set("pred_type", proj_index["pred_type"])
    context.set("data_path", proj_index["data_path"])
    pass