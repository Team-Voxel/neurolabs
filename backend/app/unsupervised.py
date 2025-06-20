import sklearn.cluster as skc
import sklearn.mixture as skm
import sklearn.metrics as metrics
import umap
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
    
    try:    
        df = safe_read_csv(config.get("data_path", "tempdata.csv"))
        # Drop the last column

        # This method of dropping the last column is not robust.
        """ if df.shape[1] > 1:
            df = df[:, :-1] """
        
        # Instead, we explicitly get the target column and remove it if it exists
        target = config.get("target", None)
        actual_labels = df[target].tolist() if target is not None and target in df.columns else None
        if target is not None and target in df.columns:
            df = df.drop(columns=[target])
        
        if df.shape[1] < 2:
            raise ValueError("DataFrame must have at least two columns for clustering.")

        df = df.to_numpy()

        algorithm = config.get("algorithm", "kmeans")
        n_clusters = config.get("n_clusters", 3)
        bandwidth = config.get("bandwidth", 1.0)
        eps = config.get("eps", 0.5)
        min_samples = config.get("min_samples", 5)
        affinity = config.get("affinity", "euclidean")
        linkage = config.get("linkage", "ward")
        xi = config.get("xi", 0.05)
        threshold = config.get("threshold", 0.5)
        require_dim_redux = config.get("require_dimension_reduction", False)
        dim_redux_method = config.get("dim_redux_method", "pca")

        explained_variance = None

        if require_dim_redux:
            if dim_redux_method == "pca":
                from sklearn.decomposition import PCA
                pca = PCA(n_components=2)
                df = pca.fit_transform(df)
                explained_variance = pca.explained_variance_ratio_.tolist()
            elif dim_redux_method == "umap":
                reducer = umap.UMAP(n_components=2)
                df = reducer.fit_transform(df)
                explained_variance = None  # UMAP does not provide explained variance like PCA
            elif dim_redux_method == "lle":
                from sklearn.manifold import LocallyLinearEmbedding
                lle = LocallyLinearEmbedding(n_components=2)
                df = lle.fit_transform(df)
                explained_variance = None  # LLE does not provide explained variance like PCA
            elif dim_redux_method == "mds":
                from sklearn.manifold import MDS
                mds = MDS(n_components=2)
                df = mds.fit_transform(df)
                explained_variance = None  # MDS does not provide explained variance like PCA
            elif dim_redux_method == "isomap":
                from sklearn.manifold import Isomap
                isomap = Isomap(n_components=2)
                df = isomap.fit_transform(df)
                explained_variance = None  # Isomap does not provide explained variance like PCA
            else:
                raise ValueError(f"Unsupported dimension reduction method: {dim_redux_method}")
        
        # Create the clustering model based on the specified algorithm
        if algorithm == "kmeans":
            model = skc.KMeans(n_clusters=n_clusters)
        elif algorithm == "agglomerative":
            model = skc.AgglomerativeClustering(n_clusters=None, linkage=linkage, distance_threshold=threshold)
        elif algorithm == "dbscan":
            model = skc.DBSCAN(eps=eps, min_samples=min_samples, metric='euclidean')
        elif algorithm == "birch":
            model = skc.Birch(n_clusters=None if n_clusters <= 0 else n_clusters, threshold=threshold)
        elif algorithm == "spectral":
            model = skc.SpectralClustering(n_clusters=n_clusters, affinity=affinity)
        elif algorithm == "meanshift":
            model = skc.MeanShift(bandwidth=None if bandwidth <= 0 else bandwidth)
        elif algorithm == "affinitypropagation":
            model = skc.AffinityPropagation()
        elif algorithm == "optics":
            model = skc.OPTICS(min_samples=min_samples, cluster_method='xi', xi=xi, metric='euclidean')
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
            "actual_labels": actual_labels,
            "silhouette": silhouette_score,
            "CHI": calinski_harabasz_score,
            'explained_variance': explained_variance,
        }    
    except Exception as e:
        print(f"Error during clustering: {e}")
        return {
            "error": str(e),
            "X": [],
            "labels": [],
            "actual_labels": None,
            "silhouette": None,
            "CHI": None,
            'explained_variance': None,
        }