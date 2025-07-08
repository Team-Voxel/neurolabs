import React, { useReducer, useState } from 'react';
import { Typography, Card, Tooltip, Flex } from 'antd';
import { SettingControl } from '../settings/types';
import Settings from '../settings/Settings';



export const ParameterInterface : React.FC<{ model_type: string }> = ({model_type}) => {

    type Action =
  | { type: 'SET_PARAM'; model: string; param: string; value: any }
  | { type: 'RESET_MODEL'; model: string }
  | { type: 'GET_MODEL'; model: string}
  | { type: 'GET_PARAM'; model: string; param: string};

    function controlsReducer(
    state: Record<string, Record<string, any>>,
    action: Action
    ): typeof state {
    switch (action.type) {
        case 'SET_PARAM':
        return {
            ...state,
            [action.model]: {
            ...state[action.model],
            [action.param]: action.value,
            },
        };
        case 'RESET_MODEL':
        return {
            ...state,
            [action.model]: {},
        };
        case 'GET_MODEL':
        return state[action.model];
        case 'GET_PARAM':
        return state[action.model][action.param];
        default:
        return state;
    }
    }

    
    const [controls, dispatch] = useReducer(controlsReducer, {});

    const modelParameters : Record<string, SettingControl[]> = {
        linear: [
            {
                id: 'loss',
                label: 'Loss',
                type: 'select',
                options: [
                    {value: 'squared_loss', label: 'Squared Error'},
                    {value: 'huger', label: 'Huber'},
                ],
                onChange: (value) => { dispatch({type: 'SET_PARAM', model: model_type, param: 'loss', value: value})},
                value: controls[model_type]['loss'],
                tooltip: 'Loss function'
            }
        ]
    }
    return (
        <div>
            {/* Add your component logic here */}
        </div>
    );

}