import React from "react";
import { Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DatasetSummary, DataSummaryEntry } from '../../backend_api/types';
import { Area, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { AreaChart, Bar } from 'recharts';

export interface DFOverviewModelProps {
    datasetSummary: DatasetSummary;
    onRowSelectionChange?: (selectedRowKeys: React.Key[]) => void;
    selectedRowKeys?: React.Key[];
    rowSelection?: {selectedRowKeys: React.Key[];}
    visible: boolean;
}


export function getColumns(): ColumnsType<DataSummaryEntry> {
    return [
      {
        title: 'Feature Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: 'Distribution',
        key: 'dist',
        width: 200,
        render: (_, record) => {return (
            <div
                style={{
                    width: '100%',
                    height: '80px',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px dashed #d9d9d9',
                }}
            >
            <ResponsiveContainer width="100%" height="100%">
                {renderChart(record)}
            </ResponsiveContainer>
            </div>
            )},
      },
      {
        title: 'Missing (%)',
        dataIndex: 'missing_percent',
        key: 'missing',
      },
      {
        title: 'Central Tendency',
        dataIndex: 'central',
        key: 'central',
      },
      {
        title: 'Dispersion',
        dataIndex: 'dispersion',
        key: 'dispersion',
      },
      {
        title: 'Data Range',
        dataIndex: 'range',
        key: 'range',
      },
    ];
  }

export const OverviewModel: React.FC<DFOverviewModelProps> = ({ 
    datasetSummary,
    visible
 }) => 
{

    return (
        <div className='flex flex-col gap-4'>
           {visible && (
            <>
            <Typography.Title level={4}>Feature Overview</Typography.Title>
            <Table<DataSummaryEntry>
                /* rowSelection={{ type: 'checkbox', ...rowSelection }} */
                columns={getColumns()}
                dataSource={datasetSummary.featureSummaries}  
                size='small'
                pagination={false}
            />
            </>
            )}
        </div>
    );
}

function renderChart(featureData: DataSummaryEntry) {
    switch (featureData.type) {
        case 'Categorical':
            return (
                <BarChart 
                data={featureData.dist}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                    <XAxis hide dataKey="name" tick={false} />
                    <YAxis hide tick={false} />
                    <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
            );
        case 'Numeric':
            return (
                <AreaChart
                    data={featureData.dist}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                    {/* <XAxis dataKey="x" tickFormatter={(tick) => {return tick.toFixed(0)}} /> */}
                    <XAxis hide dataKey="x" tick={false} />
                    <YAxis hide tick={false}/>
                    <Area type="monotone" dataKey="y" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
            );
        default:
            return (<div>None</div>)
    }
}