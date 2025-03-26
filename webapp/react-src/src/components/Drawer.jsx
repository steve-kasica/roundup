const drawerWidth = 240;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
  });
  
  const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
      width: `calc(${theme.spacing(8)} + 1px)`,
    },
  });

  const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  }));

  const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme }) => ({
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
      variants: [
        {
          props: ({ open }) => open,
          style: {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
          },
        },
        {
          props: ({ open }) => !open,
          style: {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
          },
        },
      ],
    }),
  );

              {/* <Collapse 
                in={isOpen} 
                orientation="horizontal"
                sx={{
                    marginLeft: "100px",
                    maxWidth: "400px"
                }}
            >
                <Paper>
                    <IconButton 
                        aria-label="close" 
                        onClick={() => dispatch(setSidebarStatus(SIDEBAR_CLOSED))}
                        sx={{
                            position: "absolute",
                            top: "0",
                            right: "0"
                        }}
                    >
                        <CloseDrawerButton />
                    </IconButton>
                    <ul>
                        <li>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Suscipit odio amet officiis id, tenetur dicta fugit accusamus molestias voluptatibus voluptas velit ipsum! Accusamus, porro! Soluta temporibus natus culpa adipisci laudantium.</li>
                        <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi tempore quisquam reprehenderit assumenda accusamus quas quia sed, nihil consectetur porro architecto in quos? Omnis consectetur enim quaerat hic at possimus.</li>
                        <li>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Fugit optio ullam repellendus laboriosam corporis ipsa, illum, illo beatae aut autem placeat doloribus praesentium veritatis facere cumque modi mollitia error accusamus.</li>
                    </ul>
                </Paper>
            </Collapse>         */}