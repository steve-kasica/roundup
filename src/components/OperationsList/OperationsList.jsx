import { List, ListItemText, ListItemButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { stratify } from "../../data/tableTreeSlice";
import { setSelectedOperation } from "../../data/uiSlice";

export default function OperationsList() {
    const root = useSelector(({tableTree}) => stratify(tableTree.tree));
    const {selectedOperation} = useSelector(({ui}) => ui)
    const dispatch = useDispatch();
    
    // Collect all interior nodes into a flat array
    const interiorNodes = [];
    findInteriorNodes(root); 

    return (
        <>
            <h3>Operations list</h3>
            <List dense>
            {interiorNodes.map((node, index) => (
                <ListItemButton 
                    key={`node-${index}`}
                    selected={selectedOperation && node.data.id === selectedOperation.id}
                    onClick={() => dispatch(setSelectedOperation(node.data))}
                >
                    <ListItemText
                        primary={`${index + 1}. ${node.data.type} ${node.children.map(({data}) => data.name).join(", ")}`}
                    />
                </ListItemButton>
            ))}
            </List>
        </>
    );
    
    function findInteriorNodes(node) {
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => findInteriorNodes(child));
            interiorNodes.push(node);                        
        }
    };
}