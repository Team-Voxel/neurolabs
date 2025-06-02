import React, {useState, useEffect} from "react";
import {VisualModel} from "./VisualModel";
import { DFOverviewModel } from "./DFOverviewModel";
import { DistributionModel } from "./DistributionModel";
import { RelationsModel } from "./RelationsModel";
import type { EDAData, DFRelationship, DFStats } from "../../backend_api/types";
import { useWorkflowStore } from "../../AppState";
import { Flex, Radio } from 'antd';
import SelectableIconButton from "../SelectableIconButton";
import ImageButton from "../ImageButton";
import { HomeOutlined, ClusterOutlined, ShrinkOutlined } from "@ant-design/icons";
import { Tabs, Dropdown, MenuProps, Button } from 'antd'

const { TabPane } = Tabs;

const items = [
    {
      label: 'Tab 1',
      key: '1',
      children: 'Content of editable tab 1',
    },
    {
      label: 'Tab 2',
      key: '2',
      children: 'Content of editable tab 2',
    },
    {
      label: 'Tab 3',
      key: '3',
      children: 'Content of editable tab 3',
    },
  ];

  const tab_items = [
    {
      key: '1',
      label: (
        <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
          1st menu item
        </a>
      ),
    },
    {
      key: '2',
      label: (
        <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
          2nd menu item (disabled)
        </a>
      ),
      disabled: true,
    },
    {
      key: '3',
      label: (
        <a target="_blank" rel="noopener noreferrer" href="https://www.luohanacademy.com">
          3rd menu item (disabled)
        </a>
      ),
      disabled: true,
    },
    {
      key: '4',
      danger: true,
      label: 'a danger item',
    },
  ];

export const DataModel: React.FC = () => {
    const [source, setSource] = useState<string>('generate');
    const [overview, setOverview] = useState<string>('overview');
    const [features, setFeatures] = useState<number>(1);
    const [problem, setProblem] = useState<'regress' | 'classify'>('regress');
    const [data, setData] = useState<EDAData | null>(null);
    
    const [selected, setSelected] = useState<boolean>(false);
    // Use the hook to subscribe to state changes
    const wfStore = useWorkflowStore();

    useEffect(() => {
        const workflow = wfStore.current;
        if (workflow) {
            window.wfStore.getPCDFile(workflow.name).then((pcd) => {
                setData(pcd);
            });
        }
    }, []);

    const onEdit = (targetKey, action) => {
        if (action === "remove") {
          console.log("Remove tab", targetKey);
        }
        // Don't handle "add" here, since we're overriding it with the dropdown
      };
    
      const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
        console.log(`Selected: ${key}`);
        // Do your logic here: open modal, create tab, etc.
      };

    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newSource: string,
    ) => {
        setSource(newSource);
    };

    const addButton = (
        <Dropdown  placement="topLeft">
        <Button>topLeft</Button>
      </Dropdown>
      );

    return (
        <Flex dir="column" style={{ width: '100%' }} className="gap-4">
            <Tabs
            type="editable-card"
            onEdit={onEdit}
            addIcon={addButton}
            >
            </Tabs>
        </Flex>
    );
}
