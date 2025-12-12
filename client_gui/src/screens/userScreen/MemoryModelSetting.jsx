import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMemoryModel, updateMemoryModel } from "../../api/store/actions/auth_service/user.actions";
import MessageBox from "../../components/subComponents/MessageBox";
import { 
    Table, 
    TableHead, 
    TableBody, 
    TableRow, 
    TableHeaderCell, 
    TableCell,
    Button,
    Text,
    Flex,
    Grid,
    Col 
} from "@tremor/react";
import RadioButton from "../../components/subComponents/RadioButton";
import InformationDialog from "../../components/subComponents/InformationDialog";

const MemoryModelSetting = () => {
    const dispatch = useDispatch();

    const { loading, error, memoryModel } = useSelector((state) => state.getUserMemoryModel);
    const [selectedMemoryModel, setSelectedMemoryModel] = useState(null);
    const didMemoryModel = useRef();
    
    useEffect(() => {
        if (didMemoryModel.current) return;
        dispatch(getMemoryModel());
        didMemoryModel.current = true;
    }, [dispatch]);

    useEffect(() => {
        if (memoryModel && !selectedMemoryModel) {
            setSelectedMemoryModel(memoryModel.toString());
        }
    }, [memoryModel, selectedMemoryModel]);

    const updateModel = () => {
        if (selectedMemoryModel) {
            dispatch(updateMemoryModel(selectedMemoryModel));
        }
    }

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <MessageBox message={error} />
            ) : (
                <Table>
                    <TableHead>
                        <TableRow className="border-b border-tremor-border dark:border-dark-tremor-border">
                            <TableHeaderCell>
                                <Flex justifyContent="start" alignItems="center" className="gap-2">
                                    <Text className="text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                        Choose Memory Model
                                    </Text>
                                </Flex>
                            </TableHeaderCell>
                            <TableHeaderCell></TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                <Grid numItems={2}>
                                    <Col numColSpan={1}>
                                        <div className="flex items-center gap-2">
                                            <RadioButton
                                                id="default-model-radio"
                                                color="blue"
                                                value="1"
                                                getter={selectedMemoryModel}
                                                setter={setSelectedMemoryModel}
                                                label="Default Model"
                                            />
                                            <InformationDialog
                                                title="Default Model"
                                                content="The Default Model uses basic memory capabilities suitable for general tasks without advanced context retention." />
                                        </div>
                                    </Col>
                                    <Col numColSpan={1}>
                                        <div className="flex items-center gap-2">
                                            <RadioButton
                                                id="graph-model-radio"
                                                color="red"
                                                value="2"
                                                getter={selectedMemoryModel}
                                                setter={setSelectedMemoryModel}
                                                label="Graph Model"
                                            />
                                            <InformationDialog
                                                title="Graph Model"
                                                content="The Graph Model leverages a graph-based memory structure to enhance context retention and relationship mapping for complex interactions." />
                                        </div>
                                    </Col>
                                </Grid>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button 
                                    variant="primary" 
                                    color="indigo" 
                                    onClick={updateModel}
                                    disabled={!selectedMemoryModel || selectedMemoryModel === memoryModel?.toString()}
                                >
                                    Save Memory Model
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            )}
        </>
    );
}

export default MemoryModelSetting;
