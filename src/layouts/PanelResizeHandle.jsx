/**
 * PanelResizeHandle.jsx
 * 
 * 
 */
import { PanelResizeHandle } from "react-resizable-panels";
import { DragIndicator } from '@mui/icons-material';

export default function() {
    return (
        <PanelResizeHandle style={{
            width: "15px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}>
            <DragIndicator />
        </PanelResizeHandle>
    )
}