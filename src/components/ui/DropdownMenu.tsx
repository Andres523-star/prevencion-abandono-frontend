import React, { useState } from 'react';
import '../../styles/dropdownMenu.css';

export interface DropdownItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

export interface DropdownMenuProps {
  triggerText: string;
  items: DropdownItem[];
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ triggerText, items }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="ui-dropdown">
      <button type="button" className="ui-dropdown-trigger" onClick={() => setOpen(!open)}>
        {triggerText} &#9662;
      </button>
      {open && (
        <div className="ui-dropdown-menu">
          {items.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className={`ui-dropdown-item ${item.danger ? 'danger' : ''}`}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
