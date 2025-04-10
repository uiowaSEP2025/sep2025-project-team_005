"use client";

import { Button, Box, Menu, MenuItem } from "@mui/material";
import { ReactNode, useState } from "react";

type MenuItemType = {
    label: string;
    onClick: (item: any) => void;
};
  
type DropdownProps = {
    buttonLabel: ReactNode;
    menuItems: (MenuItemType | null | undefined)[];
    sx?: object;
};

const Dropdown = ({ buttonLabel, menuItems, sx }: DropdownProps) => {

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
  
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };
  
    return (
        <Box>
            <Button
                id="basic-button"
                aria-controls={open ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
                sx={sx}
            >
                {buttonLabel}
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                list: {
                    'aria-labelledby': 'basic-button',
                },
                }}
            >
                {menuItems
                .filter((menuItem): menuItem is MenuItemType => menuItem !== null && menuItem !== undefined)
                .map((menuItem, index) => (
                <MenuItem
                    key={index}
                    onClick={() => {
                    menuItem.onClick(menuItem);
                    handleClose();
                    }}
                    data-testid={`menu-item-${menuItem.label.toLowerCase().replace(" ", "-")}`}
                >
                    {menuItem.label}
                </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};

export default Dropdown;