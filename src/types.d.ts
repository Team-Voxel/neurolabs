import { Workflow, UserModel } from './AppState';
import { EDAData } from './backend_api/types';

declare global {
  interface Window {
    wfStore: {
      loadAll(): Promise<Workflow[]>;
      saveOne(wf: Workflow): Promise<Workflow>;
      deleteOne(name: string): Promise<Workflow[]>;
      getModels(name: string): Promise<UserModel[]>;
      getWfDir: (name: string) => Promise<string>;
      getPCDFile: (name: string) => Promise<EDAData>;
    };
    fsAPI: {
      readFile: (path: string) => Promise<string>;
      writeFile: (path: string, content: string) => Promise<void>;
      createDir: (path: string) => Promise<void>;
      copyFile: (src: string, dest: string) => Promise<void>;
      joinPath: (...paths: string[]) => Promise<string>;
      resolvePath: (path: string) => Promise<string>;
      getExtension: (file: string) => Promise<string>;
      getTempDatasetPath: () => Promise<string>;
    };
  }
} 
export {};