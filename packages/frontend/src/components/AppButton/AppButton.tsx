import React from 'react';
import styles from './AppButton.module.css';

export interface AppButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'soft' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg';
  icon?: string | React.ReactNode; // Material Icons name or React component
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
  className?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  onClick,
  disabled = false,
  type = 'button',
  ariaLabel,
  className = '',
}) => {
  const classNames = [
    styles.btn,
    styles[`btn--${variant}`],
    styles[`btn--${size}`],
    icon && !children ? styles['btn--icon-only'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
    >
      {icon &&
        (typeof icon === 'string' ? <span className="material-icons-outlined">{icon}</span> : icon)}
      {children}
    </button>
  );
};

export default AppButton;
