import React, {useState, useEffect} from 'react';
import { DFRelationship, FeatureImportanceData } from '../../backend_api/types';
import { Typography } from 'antd';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface FeatureImportanceProps {
    relationships: DFRelationship;
}

export const FeatureImportance: React.FC<FeatureImportanceProps> = ({relationships}) => {
    const [data, setData] = useState<FeatureImportanceData[]>([]);
    useEffect(() => {
        const result: FeatureImportanceData[] = relationships.featureImportance.flatMap(({ feature, importance }) => ({
              feature,
              importance
            }));
        setData(result);
    }, [relationships]);

    return (
        <div className='flex flex-col h-full w-full p-4'>
            <Typography.Title level={3}>Feature Importances</Typography.Title>
            <div className='flex-1'>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0}}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis angle={-45} textAnchor="end" height={100} dataKey="feature" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="importance" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};