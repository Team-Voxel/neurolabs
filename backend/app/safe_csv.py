import csv
import pandas as pd
from typing import Dict


def detect_csv_parameters(file_path: str) -> Dict:
    """
    Automatically detect CSV file parameters including delimiter and quote character.
    Returns a dictionary with parameters to use with pd.read_csv
    """
    print(f"Detecting CSV parameters for {file_path}")
    # Read a sample of the file
    with open(file_path, 'r', encoding='utf-8') as f:
        sample = ''.join(f.readline() for _ in range(5))  # Read first 5 lines
    
    # Use csv.Sniffer to detect parameters
    sniffer = csv.Sniffer()
    dialect = sniffer.sniff(sample)
    has_header = sniffer.has_header(sample)
    
    return {
        'delimiter': dialect.delimiter,
        'quotechar': dialect.quotechar if dialect.quoting != csv.QUOTE_NONE else None,
        'header': 0 if has_header else None
    }

def safe_read_csv(file_path: str) -> pd.DataFrame:
    """
    Safely read a CSV file with automatic parameter detection
    """
    try:
        params = detect_csv_parameters(file_path)
        return pd.read_csv(file_path, **params)
    except Exception as e:
        # Fallback to default pandas read_csv if detection fails
        return pd.read_csv(file_path)

