export interface ConnectionDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
  }
  