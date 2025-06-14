import React, {useState, useEffect} from "react";
import { HomeOutlined, ClusterOutlined, ShrinkOutlined, BoxPlotOutlined, BarChartOutlined } from "@ant-design/icons";
import { Menu, MenuItem } from "../Menu";
import { Workflow } from "../../AppState";
import { message, Typography } from "antd";
import { StatisticsModel } from "./StatisticsModel";
import { EDAData, DatasetSummary } from "../../backend_api/types";
import { OverviewModel } from "./DFOverviewModel";
import { RelationsModel } from "./RelationsModel";


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
      key: 'distribution',
      label: 'Distribution',
      children: [
        {
          key: 'numeric',
          label: 'Numeric',
          //icon: <BoxPlotOutlined />,
        },
        {
          key: 'categorical',
          label: 'Categorical',
          //icon: <BarChartOutlined />,
        }
      ]
    },
    {
      key: 'relations',
      label: 'Relations',
      children: [
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
    },
    {
      key: 'visualization',
      label: 'Visualization',
      children: [
        {
          key: 'projection',
          label: 'XY Projection',
        },
      ]
    },
    {
      key: 'unsupervised',
      label: 'Unsupervised',
        children: [
          {
            key: 'clustering',
            label: 'Clustering',
            //icon: <ClusterOutlined />,
          },
          {
            key: 'dim-redux',
            label: 'Dimensionality Reduction',
            //icon: <ShrinkOutlined />,
          },
          {
            key: 'gmm',
            label: 'Gaussian Mixture Model',
            //icon: <ClusterOutlined />,
          },
          {
            key: 'brbm',
            label: 'Restricted Boltzmann Machine',
            //icon: <ClusterOutlined />,
          },
      ]
    }
]

export const DataModel: React.FC = () => {
    const [edaFile, setEdaFile] = useState<EDAData | null>(null);
    const [selected, setSelected] = useState<string>('statistics');
    
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
            </div>
        </div>
    );
}
