
interface UserModel {
    id: number;
    name: string;
    description: string;
    type: string; // e.g., 'SGDR', 'SVM/R', 'RandomForest', 'DeepLearning'
}

interface Project {
    id: number;
    name: string;
    models: UserModel[]; // Array of model names or IDs    
}
  

export class AppState {
    private static _instance: AppState | null = null;
    private _currentProject: number = 0;
    private _currentModel: number = 0;
    private _allProjects: string[] = [];
  
    private constructor() {}
  
    public static getInstance(): AppState {
      if (!AppState._instance) {
        AppState._instance = new AppState();
      }
      return AppState._instance;
    }
  }