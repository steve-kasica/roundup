
export function SourceColumns({}) {

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Source Columns</SidebarGroupLabel>
            <SidebarMenu>
                {Columns.map(column => (
                    <Collapsible 
                        key={column.id}
                        asChild
                        className="group/collapsible"
                    >
                    </Collapsible>
                ))}
            </SidebarMenu>
      </SidebarGroup>
    )
}