import { Workflow, UserModel } from './AppState';
import { EDAData } from './backend_api/types';

declare global {
  interface Window {
    electronAPI: {
      /**
       * Opens a new child window rendering the specified React component with given props.
       * @param options.component - The key of the component to render (must match a key in your componentMap).
       * @param options.props - Props to pass into the rendered component.
       */
      openChildWindow(options: { component: string; props: any }): Promise<void>;

      /**
       * Register a callback to receive initialization data when the child window finishes loading.
       * @param cb - Function invoked with the data object containing `component` and `props`.
       */
      onChildInit(cb: (data: { component: string; props: any }) => void): void;
    };
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