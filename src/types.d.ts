import { Workflow, UserModel } from './AppState';

declare global {
  interface Window {
    wfStore: {
      loadAll(): Promise<Workflow[]>;
      saveOne(wf: Workflow): Promise<Workflow>;
      deleteOne(name: string): Promise<Workflow[]>;
      getModels(name: string): Promise<UserModel[]>;
      getWfDir: (name: string) => Promise<string>;
    };
    fsAPI: {
      readFile: (path: string) => Promise<string>;
      writeFile: (path: string, content: string) => Promise<void>;
      createDir: (path: string) => Promise<void>;
      copyFile: (src: string, dest: string) => Promise<void>;
      joinPath: (...paths: string[]) => Promise<string>;
      resolvePath: (path: string) => Promise<string>;
      getExtension: (file: string) => Promise<string>;
    };
  }
} 
export {};