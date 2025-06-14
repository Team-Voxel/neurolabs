import sklearn.cluster as skc
import sklearn.mixture as skm
import sklearn.metrics as metrics
from safe_csv import safe_read_csv



def cluster_data(config: dict):
    """
    Clusters data using the specified clustering algorithm from the config.

    Args:
        config (dict): Configuration dictionary containing clustering parameters.

    Returns:
        list: List of cluster labels for each data point.
    """
    # Extract parameters from the config
    print("Clustering data with config:", config)
    try:    
        df = safe_read_csv(config.get("data_path", "tempdata.csv")).to_numpy()
        # Drop the last column
        if df.shape[1] > 1:
            df = df[:, :-1]  # Drop the last column if it exists
        algorithm = config.get("algorithm", "kmeans")
        param1 = config.get("param1", 3)
        param2 = config.get("param2", 3)
        
        # Create the clustering model based on the specified algorithm
        if algorithm == "kmeans":
            model = skc.KMeans(n_clusters=param1)
        elif algorithm == "agglomerative":
            model = skc.AgglomerativeClustering(n_clusters=param1, linkage=param2)
        elif algorithm == "dbscan":
            model = skc.DBSCAN(eps=param1, min_samples=param2, metric='euclidean')
        elif algorithm == "birch":
            model = skc.Birch(n_clusters=None if param1 <= 0 else param1, threshold=param2)
        elif algorithm == "spectral":
            model = skc.SpectralClustering(n_clusters=param1, affinity=param2)
        elif algorithm == "meanshift":
            model = skc.MeanShift(bandwidth=None if param1 <= 0 else param1)
        elif algorithm == "affinitypropagation":
            model = skc.AffinityPropagation(damping=param1, preference=param2)
        elif algorithm == "optics":
            model = skc.OPTICS(min_samples=param2, cluster_method='xi', xi=param1, metric='euclidean')
        elif algorithm == "gmm":
            model = skm.GaussianMixture(n_components=2, covariance_type='full')
        else:
            raise ValueError(f"Unsupported clustering algorithm: {algorithm}")

        y = model.fit_predict(df)

        silhouette_score = metrics.silhouette_score(df, y, metric='euclidean')
        
        calinski_harabasz_score = metrics.calinski_harabasz_score(df, y)
        # Fit the model and return the cluster labels
        return {
            'X': df.tolist(),
            "labels": y.tolist(),
            "silhouette": silhouette_score,
            "CHI": calinski_harabasz_score,
        }    
    except Exception as e:
        print(f"Error during clustering: {e}")
        return {
            "error": str(e),
            "X": [],
            "labels": [],
            "silhouette": None,
            "CHI": None,
        }