
class Config:
    # Model
    max_features = 10
    n_estimators = 100
    # Data
    default_split_ratio = 0.8

    def fromJSON(self, json_str: str):
        import json
        data = json.loads(json_str)
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
            else:
                raise KeyError(f"Invalid config key: {key}")
            


Global_Conf = Config()
