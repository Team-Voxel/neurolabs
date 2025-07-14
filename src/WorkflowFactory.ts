import { Workflow } from './AppState';
import { readFile } from 'fs/promises';
import path from 'path';

export function createWorkflowInstance(name: string, problemType: string, target: string, wfDirectory: string): Workflow {
  const workflow: Workflow = {
    name: name,
    problemType: problemType,
    target: target,
    wfDir: wfDirectory,
    datafile: path.join(wfDirectory, 'data.csv'),
    edaFile: path.join(wfDirectory, 'edadata.json'),
    datasetMetadataFile: path.join(wfDirectory, 'dataset_metadata.json'),
    modelMetadataFile: path.join(wfDirectory, 'metadata.json'),

    /* async getEDAFile() {
      const data = await readFile(this.edaFile, 'utf-8');
      return JSON.parse(data);
    },

    async getModelMetadata() {
      const data = await readFile(this.modelMetadataFile, 'utf-8');
      return JSON.parse(data);
    },

    async getDatasetMetadata() {
      const data = await readFile(this.datasetMetadataFile, 'utf-8');
      return JSON.parse(data);
    } */
  };

  return workflow;
}