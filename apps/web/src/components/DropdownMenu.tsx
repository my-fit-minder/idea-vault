import React, { useState, useRef, useEffect } from 'react';
import './DropdownMenu.css';

interface DropdownMenuProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
}

export function DropdownMenu({ children, trigger }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Clone children to add close handler
  const childrenWithClose = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // Check if it's a DropdownMenuItem by checking if it has the expected props
      const props = child.props as any;
      if (props.onClick && (props.icon !== undefined || props.danger !== undefined || props.children)) {
        return React.cloneElement(child as React.ReactElement<DropdownMenuItemProps>, {
          onClick: () => {
            props.onClick();
            setIsOpen(false);
          },
        });
      }
    }
    return child;
  });

  return (
    <div className="dropdown-menu-container" ref={menuRef}>
      <button
        className="dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="More options"
        aria-expanded={isOpen}
      >
        {trigger}
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          {childrenWithClose}
        </div>
      )}
    </div>
  );
}

interface DropdownMenuItemProps {
  onClick: () => void;
  children: React.ReactNode;
  icon?: string;
  danger?: boolean;
}

export function DropdownMenuItem({ onClick, children, icon, danger }: DropdownMenuItemProps) {
  const handleClick = () => {
    onClick();
  };

  return (
    <button
      className={`dropdown-menu-item ${danger ? 'danger' : ''}`}
      onClick={handleClick}
    >
      {icon && <span className="dropdown-menu-icon">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
