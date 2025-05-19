from stage import *

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import torch.nn as nn

df = pd.read_csv('qsar-biodeg.csv')
dnn_config = [
    {
        'type':'Linear',
        'param': {
            'in_features' : 41,
            'out_features': 80,
            'activation' : 'relu'
        }
    },
    {
        'type':'Linear',
        'param': {
            'in_features' : 80,
            'out_features': 2,
            'activation' : 'relu'
        }
    }
]

dnn = DNN(dnn_config, 'test')
scaler = StandardScaler()
features = df.drop(['Class'], axis=1).values

features = scaler.fit_transform(features)
classes = df['Class'].values

X_train, X_test, y_train, y_test = train_test_split(features, classes, test_size=0.2)
print(X_test)
result = dnn.fit(X_train, y_train, X_test, y_test, batch_size=32, lr=1e-3, epochs=10)

print(result)