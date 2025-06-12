import React, { useState, useEffect } from 'react';
import { DFStats } from '../../backend_api/types';
import { Typography, Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

export interface StatisticsModelProps {
    stats: DFStats;
}

type DynamicRow = {
    key: string | number;
    [col: string]: string | number | React.ReactNode;
};

/* const generateTable = (sample_data: { [key: string]: number[] }) => {
    // Get column keys
    const keys = Object.keys(sample_data);
  
    // Determine row count
    const rowCount = sample_data[keys[0]]?.length || 0;
  
    // Generate column definitions
    const columns: ColumnsType<DynamicRow> = keys.map((key) => ({
      title: key.charAt(0).toUpperCase() + key.slice(1),
      dataIndex: key,
      key,
    }));
  
    // Generate rows dynamically
    const dataSource: DynamicRow[] = Array.from({ length: rowCount }, (_, rowIndex) => {
      const row: DynamicRow = { key: rowIndex };
      keys.forEach((key) => {
        row[key] = sample_data[key][rowIndex];
      });
      return row;
    });
  
    return { columns, dataSource };
}; */

export const StatisticsModel: React.FC<StatisticsModelProps> = ({stats}) => {
    const [columns, setColumns] = useState<{ title: string; dataIndex: string; key: string }[]>([]);
    const [dataSource, setDataSource] = useState<DynamicRow[]>([]);
    const [projectName, setProjectName] = useState<string>('');

    useEffect(() => {
        if (stats && stats.columns) {
            const cols = stats.columns.map((col, index) => ({
                title: col,
                dataIndex: col,
                key: col,
            }));
            setColumns(cols);
        }
        if (stats && stats.sample_data) {
            const data: DynamicRow[] = stats.sample_data.map((row, index) => ({
                key: index,
                ...row,
              }));
            setDataSource(data);
        }
        if (global.appState.current) {
            setProjectName(global.appState.current.name || 'Unknown Project');
        } else {
            setProjectName('No Project Selected');
        }
    }, [stats]);

    return (
        <div className='flex flex-row items-center justify-center h-full w-full p-4'>
        <div className="flex flex-col items-start justify-start h-full w-1/4 overflow-y-auto pr-4">
            <Card title="Project Name" className='w-full'>
                <Typography.Text>{`${projectName}`}</Typography.Text>
            </Card>
            <Card title="Rows" className='w-full'>
                <Typography.Text>{`${stats.row_count}`}</Typography.Text>
            </Card>
            <Card title="Columns" className='w-full'>
                <Typography.Text>{`${stats.column_count}`}</Typography.Text>
            </Card>
            <Card title="Memory Usage" className='w-full'>
                <Typography.Text>{`${stats.memory_usage} MB`}</Typography.Text>
            </Card>
            {/* <Card title="Data Types">
                {Object.entries(stats.dtypes).map(([key, value]) => (
                    <Typography.Text key={key}>
                        {key}: {`${value}`}
                    </Typography.Text>
                ))}
            </Card> */}
        </div>
        <div className="flex flex-col pl-4 border-l items-center justify-start h-full w-3/4 overflow-auto">
            <Table dataSource={dataSource} columns={columns} pagination={false} rowKey="key"></Table>
        </div>
        </div>
    );
}