import React, { useEffect, useState } from 'react';
import { Card, Table, TableColumnsType, Tooltip, Typography } from 'antd';
import { DatasetSummary, DataSummaryEntry } from '../../backend_api/types';
import { Area, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { AreaChart, Treemap } from 'recharts';

export interface DatasetPreviewProps {
    datasetSummary: DatasetSummary;
    onRowSelectionChange?: (selectedRowKeys: React.Key[]) => void;
    selectedRowKeys?: React.Key[];
    rowSelection?: {selectedRowKeys: React.Key[];}
    visible: boolean;
}

const columns: TableColumnsType<DataSummaryEntry> = [
  {
    title: 'Feature Name',
    dataIndex: 'name',
  },
  {
    title: 'Type',
    dataIndex: 'type',
  },
  {
    title: 'Missing %',
    dataIndex: 'missing_percent',
  },
  {
    title: 'Cntral Tendency',
    dataIndex: 'central',
  },
  {
    title: 'Dispersion',
    dataIndex: 'dispersion',
  },
  {
    title: 'Data Range',
    dataIndex: 'range',
  }
];

export const FeatureOverview: React.FC<DatasetPreviewProps> = ({ 
    datasetSummary,
    onRowSelectionChange,
    selectedRowKeys,
    rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys: React.Key[]) => {
            onRowSelectionChange!(selectedRowKeys);
        },
    },
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
                columns={columns}
                dataSource={datasetSummary?.featureSummaries}
                size='small'
                pagination={false}
                scroll={{ y: 40*5 }}
            />
            </>
            )}
        </div>
    );
}

function renderChart(datasetSummary: DatasetSummary) {
    switch (datasetSummary?.targetSummary.type) {
        case 'Categorical':
            return (
                <Treemap
                    data={datasetSummary?.treeMapData}
                    dataKey="value"
                    stroke="#fff"
                >
                    <Tooltip></Tooltip>
                    <Legend></Legend>
                </Treemap>
            );
        case 'Numeric':
            const data = datasetSummary.targetKDEx?.map((xVal, i) => ({
                x: xVal,
                y: datasetSummary.targetKDEy?.[i]
              }));
            return (
                <AreaChart
                    data={data}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" tickFormatter={(tick) => {return tick.toFixed(0)}} />
                    <YAxis />
                    <Area type="monotone" dataKey="y" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
            );
        default:
            return (<AreaChart></AreaChart>)
    }
}

export const TargetOverview: React.FC<{datasetSummary : DatasetSummary, visible : boolean}> = ({ datasetSummary, visible }) => {

    return (
        <div className='flex-1 flex-col gap-4 h-full'>
            {visible && (
                <>
                {/* <Typography.Title level={4}>Target Overview</Typography.Title> */}
                <div className='flex flex-row gap-4 w-full h-full'>
                <div className='flex flex-col w-1/4 p-4 border-r border-2 border-gray-300'>
                    <Typography.Paragraph>
                        <strong>Target Name:</strong> {datasetSummary?.targetSummary.name}
                    </Typography.Paragraph>
                    <Typography.Paragraph>
                        <strong>Type:</strong> {datasetSummary?.targetSummary.type}
                    </Typography.Paragraph>
                    <Typography.Paragraph>
                        <strong>Center:</strong> {datasetSummary?.targetSummary.central}
                    </Typography.Paragraph>
                    <Typography.Paragraph>
                        <strong>Dispersion:</strong> {datasetSummary?.targetSummary.dispersion}
                    </Typography.Paragraph>
                    <Typography.Paragraph>
                        <strong>Range:</strong> {datasetSummary?.targetSummary.range}
                    </Typography.Paragraph>
                </div>
                <div className='flex flex-col w-3/4 h-full'>
                <Typography.Title level={4}>Target Distribution</Typography.Title>
                <ResponsiveContainer width='100%' height='80%'>
                {renderChart(datasetSummary)}
                </ResponsiveContainer>
                </div>
                </div>
                </>
            )}
        </div>
    );
}


