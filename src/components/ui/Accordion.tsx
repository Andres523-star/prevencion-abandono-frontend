import React, { useState } from 'react';
import '../../styles/accordion.css';

export interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="ui-accordion">
      <button
        type="button"
        className="ui-accordion-header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className={`ui-accordion-arrow ${open ? 'open' : ''}`}>&#9662;</span>
      </button>
      {open && <div className="ui-accordion-content">{children}</div>}
    </div>
  );
};
