import React, {useState, useEffect} from "react";
import { Menu, MenuItem } from "../Menu";
import { message } from "antd";
import { StatisticsModel } from "./StatisticsModel";
import { EDAData, DatasetMetadata } from "../../backend_api/types";
import { OverviewModel } from "./DFOverviewModel";
import { RelationsModel } from "./RelationsModel";
import { FeatureImportance } from "./FeatureImportance";
import { NumericalDistributions } from "./DistributionModel";


//type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
    {
      key: 'statistics',
      label: 'Statistics',
    },
    {
      key: 'overview',
      label: 'Overview',
      //icon: <HomeOutlined />,
    },
    {
      key: 'numeric',
      label: 'Numeric',
      //icon: <BoxPlotOutlined />,
    },
    {
      key: 'correlation',
      label: 'Correlation',
    },
    {
      key: 'feature-importance',
      label: 'Feature Importance',
      //icon: <ShrinkOutlined />,
    },
]

export const DataModel: React.FC = () => {
    const [edaFile, setEdaFile] = useState<EDAData | null>(null);
    const [datasetMetadata, setDatasetMetadata] = useState<DatasetMetadata | null>(null);
    const [selected, setSelected] = useState<string>('statistics');
    const [wfDir, setWfDir] = useState<string>('');
    
    useEffect(() => {
      window.stateAPI.getEDAData().then((data) => {
        if(data){
          setEdaFile(data);
        }
        else{
          message.error("Critical Error! No EDA file for the current project.");
        }
      }).catch((error) => {
        message.error("Error fetching EDA data: " + error.message);
      });

      window.stateAPI.getDatasetMetadata().then((metadata) => {
        if(metadata){
          setDatasetMetadata(metadata);
        }
        else{
          message.error("Critical Error! No dataset metadata for the current project.");
        }
      }).catch((error) => {
        message.error("Error fetching dataset metadata: " + error.message);
      });

      window.stateAPI.getAppState().then(({current}) => {
        setWfDir(current?.wfDir || '');
      }).catch((error) => {
        message.error("Error fetching app state: " + error.message);
      });
    }, []);

    return (
        <div className="flex flex-row h-full w-full">
            <div className="flex flex-col h-full w-1/5">
              <Menu 
              items={items} 
              defaultSelectedKey="statistics"
              className="h-full w-full"
              onSelect={(key, item) => {
                console.log(key, item);
                setSelected(key);
              }}
              />
            </div>
            <div className="flex flex-col h-full w-4/5 p-4">
                {edaFile && (
                    selected === 'statistics' && <StatisticsModel stats={edaFile.statistics} />
                )}
                {edaFile && (
                    selected === 'overview' && (<div className='flex max-h-full w-full overflow-auto'>
                              <OverviewModel datasetSummary={edaFile.summary} visible={true} />
                                </div>)
                )}
                {edaFile && (
                    selected === 'correlation' && (
                        <div className='flex h-full w-full'>
                            <RelationsModel rels={edaFile.relationships} cols={edaFile.statistics.columns} />
                        </div>
                    )
                )}
                {edaFile && (
                    selected === 'feature-importance' && (
                        <div className='flex h-full w-full'>
                            <FeatureImportance relationships={edaFile.relationships} />
                        </div>
                    )
                )}
                {datasetMetadata && (
                    selected === 'numeric' && (
                        <div className='flex h-full w-full'>
                            <NumericalDistributions dataset={datasetMetadata} wfDir={wfDir}/>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
