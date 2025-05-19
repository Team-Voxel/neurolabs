import React from 'react';
import { Grid, Tooltip, Box } from '@mui/material';
import ImageButton from './ImageButton';

interface SelectionItem {
  name: string;
  tooltip?: string;
  image?: string;
  description?: string;
}

interface SelectionGridProps {
  items: SelectionItem[];
  selectedItem: number;
  onSelect: (index: number) => void;
  gridColumns?: number;
  buttonSize?: {
    width: string;
    height: string;
  };
  hideTooltip?: boolean;
  optionToAddNewItem?: boolean;
  onAddNewItem?: () => void;
  addNewItemTitle?: string;
}

export const SelectionGrid: React.FC<SelectionGridProps> = ({
  items,
  selectedItem,
  onSelect,
  gridColumns = 3,
  buttonSize = { width: '100%', height: '200px' },
  hideTooltip = false,
  optionToAddNewItem = false,
  onAddNewItem = () => {},
  addNewItemTitle = 'Add New Item',
  }) => {
    return (
        <Box 
          role="radiogroup"
          aria-label="Selection grid"
        >
          <Grid 
            container 
            spacing={2}
          >
            {optionToAddNewItem && 
                <Grid
                    key={-1}
                    size={{
                        xs:12,
                        sm:6,
                        md:12 / gridColumns,
                        lg:12 / gridColumns,
                    }}
                    component="div"
                    >
                        <Box>
                            <ImageButton
                              imageUrl=""
                              title={addNewItemTitle}
                              width={buttonSize.width}
                              height={buttonSize.height}
                              onClick={() => onAddNewItem()}
                              style={{
                                backgroundColor: 'transparent',
                              }}
                              aria-checked={false}
                            />
                        </Box>
                    </Grid>
            }
            {items.map((item, index) => (
              <Grid 
                key={index}
                size={{
                    xs:12,
                    sm:6,
                    md:12 / gridColumns,
                    lg:12 / gridColumns,
                }}
                component="div"
              >
                {!hideTooltip && <Tooltip title={item.tooltip} arrow placement="top">
                  <Box>
                    <ImageButton
                      imageUrl={item.image || ''}
                      title={item.name}
                      width={buttonSize.width}
                      height={buttonSize.height}
                      onClick={() => onSelect(index)}
                      className={selectedItem === index ? 'ring-4 ring-blue-500' : ''}
                      style={{
                        backgroundColor: item.image ? 'transparent' : '#f3f4f6',
                      }}
                      aria-checked={selectedItem === index}
                    />
                  </Box>
                </Tooltip>}
                {hideTooltip && <Box>
                    <ImageButton
                      imageUrl={item.image || ''}
                      title={item.name}
                      width={buttonSize.width}
                      height={buttonSize.height}
                      onClick={() => onSelect(index)}
                      className={selectedItem === index ? 'ring-4 ring-blue-500' : ''}
                      style={{
                        backgroundColor: item.image ? 'transparent' : '#f3f4f6',
                      }}
                      aria-checked={selectedItem === index}
                    />
                  </Box>}
              </Grid>
            ))}
          </Grid>
        </Box>
      );
};

export default SelectionGrid;