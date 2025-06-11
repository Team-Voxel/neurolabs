import React, {useState, useEffect} from "react";
import { HomeOutlined, ClusterOutlined, ShrinkOutlined, BoxPlotOutlined, BarChartOutlined } from "@ant-design/icons";
import { Menu, MenuItem } from "../Menu";
import { useWorkflowStore } from "../../AppState";
import { message } from "antd";


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

    const wfStore = useWorkflowStore();
    
    useEffect(() => {
      if (wfStore.current){
        window.wfStore.getPCDFile(wfStore.current!.name).then((pcdFile) => {
            console.log(pcdFile);
            message.success(`EDA file loaded`);
        });
      }
    }, [wfStore.current]);

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex flex-col h-full w-1/5">
              <Menu 
              items={items} 
              defaultSelectedKey="statistics"
              className="h-full w-full"
              onSelect={(key, item) => {
                console.log(key, item);
              }}
              />
            </div>
        </div>
    );
}
