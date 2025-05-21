import { ToggleButtonGroup, 
    ToggleButton, 
    Button, 
    Checkbox, 
    FormControlLabel, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem,
    Slider, 
    Typography
} from "@mui/material";
import React from "react";
import FileUpload from "../fileUpload";
import { Autocomplete, TextField } from "@mui/material";
import Papa from "papaparse";
import DatasetViewer from "./VisualModel";

const data = [
    { label: 'The Shawshank Redemption', year: 1994 },
    { label: 'The Godfather', year: 1972 },
    { label: 'The Dark Knight', year: 2008 },
    { label: 'Pulp Fiction', year: 1994 },
    { label: 'Forrest Gump', year: 1994 },
    { label: 'Inception', year: 2010 },
    { label: 'Fight Club', year: 1999 },
    { label: 'The Matrix', year: 1999 },
    { label: 'Goodfellas', year: 1990 },
    { label: 'The Lord of the Rings: The Return of the King', year: 2003 },
]

function clamp(value : number, min : number, max : number) {
    return Math.max(min, Math.min(value, max));
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function onChangeFile(file : File | null, onComplete : (results : any) => void) {
    file?.path ? console.log(file.path) : console.log('No file selected');
    const config = {
        header: false,
        skipEmptyLines: true,
        complete: (results : any) => {
            onComplete(results.data);
        },
        error: (error : any) => {
            console.error('Error:', error.message);
        }
    };
    Papa.parse(file, config);
}

interface SourceContentProps {
    selection: string;
  }

const SourceContent : React.FC<SourceContentProps> = ({selection}) => {
    
    const [hasHeaders, setHasHeaders] = React.useState<boolean>(true);
    const [genType, setGenType] = React.useState<string>('classify');
    const [genFeatures, setGenFeatures] = React.useState<number>(2);
    const [redFeatures, setRedFeatures] = React.useState<number>(0);
    const [numSamples, setNumSamples] = React.useState<number>(1000);
    const [randSeed, setRandSeed] = React.useState<number>(42);
    const [targetColumn, setTargetColumn] = React.useState<string>('');

    switch (selection) {
        case 'import':
            
    
            const handleHeaderChange = (event) => {
                setHasHeaders(!hasHeaders);
            }
            const handleFileChange = (file: File | null) => {
                if (file) {
                    onChangeFile(file, (results : any) => {
                        console.log('Parsed Results:', results);
                    });
                } else {
                    console.log('No file selected');
                }
            }

            return (
                <div className="flex flex-col w-full h-full overflow-x-auto bg-white p-2 space-y-2">
                    <FileUpload accept=".csv" maxSize={1000000} onChange={handleFileChange}/>
                    
                    <FormControlLabel
                        control={<Checkbox checked={hasHeaders} onChange={handleHeaderChange} name="jason" />}
                        label="Has Headers"
                    />
                    <Button variant="contained" color="primary" className="w-1/4">Import</Button>
                </div>
            );
        case 'generate':
            

            const handleGeneratorTypeChange = (event) => {
                setGenType(event.target.value);
            }
            const handleGenFeaturesChange = (event) => {
                setGenFeatures(event.target.value);
            }
            const handleRedFeaturesChange = (event) => {
                setRedFeatures(event.target.value);
            }
            const onChangeSamples = (event) => {
                setNumSamples(clamp(event.target.value, 1, 1000000));
            }
            const onClickRandomize = () => {
                setGenFeatures(getRandomInt(50) + 1);
                setRedFeatures(getRandomInt(genFeatures - 1) + 1);
                setNumSamples(getRandomInt(1000000) + 1);
            }
            const onClickGenerate = () => {
                console.log('Generating data...');
            }
            const onChangeSeed = (event) => {
                setRandSeed(clamp(event.target.value, 0, 100000000));
            }
            return (
                <>
                    {/* <div className="flex flex-col w-full h-full overflow-y-auto bg-white p-2 border-t">
                        <Autocomplete
                        disablePortal
                        options={data}
                        renderInput={(params) => <TextField {...params} label="Select Target Column" />}
                        />
                    </div> */}
                    <FormControl variant="outlined" >
                        <div className="flex flex-col w-full h-full bg-white p-2 space-y-4 items-left">
                            <InputLabel id="gen-type-label">Generator Type</InputLabel>
                                <Select
                                labelId="gen-type-label"
                                id="gen-type"
                                value={genType}
                                label="Generator Type"
                                onChange={handleGeneratorTypeChange}
                                size="small"
                                >
                                    <MenuItem value='classify'>Classify</MenuItem>
                                    <MenuItem value='regress'>Regression</MenuItem>
                                    <MenuItem value='times'>Time Series</MenuItem>
                                </Select>
                            
                            <Typography id="gen-features-label">Number of Features</Typography>
                            <Slider 
                            aria-labelledby="gen-features-label"
                            value={genFeatures} 
                            defaultValue={2} 
                            aria-label="Default" 
                            valueLabelDisplay="auto" 
                            onChange={handleGenFeaturesChange}
                            min={1}
                            max={50}
                            step={1}
                            />
                            {genFeatures > 1 && (
                            <div>
                                <Typography id="red-features-label">Number of Redundant Features</Typography>
                                <Slider 
                                aria-labelledby="red-features-label"
                                value={redFeatures} 
                                defaultValue={0} 
                                aria-label="Default" 
                                valueLabelDisplay="auto" 
                                onChange={handleRedFeaturesChange}
                                min={0}
                                max={genFeatures - 1}
                                step={1}
                                />
                            </div>
                            )}
                            <TextField
                            id="outlined-number"
                            label="Number of Samples"
                            type="number"
                            value={numSamples}
                            onChange={onChangeSamples}
                            size="small"
                            />
                            <TextField
                            id="outlined-number"
                            label="Random Seed"
                            type="number"
                            value={randSeed}
                            onChange={onChangeSeed}
                            style={{marginBottom: '30px'}}
                            size="small"
                            />
                            <div className="flex flex-row w-full space-4 justify-between">
                                <Button onClick={onClickRandomize} variant="contained" color="primary" fullWidth style={{marginRight: '5px'}}>Randomize</Button>
                                <Button onClick={onClickGenerate} variant="contained" color="primary" fullWidth style={{marginLeft: '5px'}}>Generate</Button>
                            </div>
                        </div>
                    </FormControl>
                </>
            );
        default:
            return null;
    }
}

const VisualModel : React.FC = () => {
    const [source, setSource] = React.useState<string>('table');
    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newSource: string,
    ) => {
        setSource(newSource);
    };

    return (
        <div className="flex flex-col w-full h-full overflow-y-auto bg-white space-y-2">
            {/* <ToggleButtonGroup
                color="primary"
                value={source}
                exclusive
                onChange={handleChange}
                aria-label="Platform"
                size="small"
                fullWidth
                >
                    <ToggleButton fullWidth value={"table"} aria-label="import">Table</ToggleButton>
                    <ToggleButton fullWidth value={"dist"} aria-label="generate">Distribution</ToggleButton>
                    <ToggleButton fullWidth value={"corr"} aria-label="generate">Correlation</ToggleButton>
                </ToggleButtonGroup> */}
            <DatasetViewer></DatasetViewer>
        </div>
    );
}

export const DataModel: React.FC = () => {
    const [source, setSource] = React.useState<string>('generate');
    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newSource: string,
    ) => {
        setSource(newSource);
    };
    return (
        <div className="flex flex-row items-center h-full w-full bg-gray-100">
            <VisualModel/>  
        </div>

    );
}
