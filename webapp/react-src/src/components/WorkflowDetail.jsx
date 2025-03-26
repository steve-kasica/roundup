/**
 * WorkflowDetail.jsx
 * 
 */

import { Link, Typography } from "@mui/material";
import { useSelector } from "react-redux"

export default function() {
    const workflow = useSelector(({ui}) => ui.workflow);

    return (
        (workflow) ? (
            <>
                <Typography variant="h5">{workflow.label}</Typography>
                <hr></hr>
                <dl>
                    <MetaDataItem 
                        title="Author"
                        value={workflow.author}
                    />
                    <MetaDataItem 
                        title="News organization"
                        value={workflow.organization}
                    />
                    <MetaDataItem 
                        title="Date"
                        value={workflow.date}
                    />
                    <MetaDataItem 
                        title="Supported article"
                        value={
                            <Link href={workflow.article.url} target="_blank">
                                "{workflow.article.title}"
                            </Link>
                        }
                    />

                    <MetaDataItem 
                        title="Source code"
                        value={
                            <Link href={workflow.sourceUrl} target="_blank">
                                {workflow.sourceUrl.replace(RegExp("^https?:\/\/[^\/]+\/"), "")}
                            </Link>
                        }
                    />
                    <MetaDataItem
                        title="Programming environment"
                        value={`${workflow.environment} (${workflow.language})`}
                    />
                </dl>
            </>
        ) : null
    );
}

function MetaDataItem({title, value}) {
    return (<>
        <dt style={{fontWeight: "bold", marginTop: "15px"}}>{title}</dt>
        <dd>{value}</dd>
    </>)
}