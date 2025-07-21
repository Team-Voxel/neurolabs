import json
import numpy as np
from typing import Any, Dict, List, Union

def _is_nan(value: Any) -> bool:
    """Helper function to check if a value is NaN, handling NumPy and standard float NaNs."""
    if isinstance(value, float) and np.isnan(value):
        return True
    if isinstance(value, (np.floating, np.integer)) and np.isnan(value):
        return True
    return False

def _is_json_serializable(value: Any) -> bool:
    """
    Checks if a value is JSON serializable. This is a robust check
    for common Python types.
    """
    try:
        json.dumps(value)
        return True
    except (TypeError, OverflowError):
        # Catch common errors related to non-serializable types like
        # NumPy integers/floats, complex numbers, or specific object types.
        return False

def sanitize_for_json(data: Union[Dict, List, Any]) -> Union[Dict, List, Any]:
    """
    Recursively sanitizes a dictionary or list for JSON serialization by 
    replacing NaN values and other non-JSON-serializable types.

    Parameters:
        data: The dictionary, list, or value to sanitize.

    Returns:
        The sanitized data structure.
    """
    
    # Handle Dictionaries
    if isinstance(data, dict):
        sanitized_dict = {}
        for key, value in data.items():
            # Recursively process the value
            sanitized_dict[key] = sanitize_for_json(value)
        return sanitized_dict

    # Handle Lists and Tuples (convert tuples to lists for JSON compatibility)
    elif isinstance(data, (list, tuple)):
        sanitized_list = [sanitize_for_json(item) for item in data]
        return sanitized_list

    # Handle individual values (e.g., numbers, strings, None)
    else:
        # 1. Handle NaN values (float NaN and NumPy NaN)
        if _is_nan(data):
            return None  # Replace NaN with None (JSON null)

        # 2. Handle NumPy numeric types
        # These are often JSON serializable but sometimes cause issues.
        # Converting them to standard Python types is safer.
        if isinstance(data, (np.integer, np.floating)):
            return data.item()  # Convert NumPy scalar to Python standard scalar

        # 3. Handle other non-serializable types
        if not _is_json_serializable(data):
            # If the value is not serializable (e.g., datetime objects, complex numbers,
            # or custom objects), replace it with None.
            return None

        # 4. If the value is already serializable, return it as is
        return data