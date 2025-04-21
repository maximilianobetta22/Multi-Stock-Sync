import { DropdownFilterProps } from "../Types/warehouse.type";
import React from "react";
import styles from "../Views/Home/HomeBodega.module.css";

const DropdownFilter: React.FC<DropdownFilterProps> = ({
  id,
  label,
  value,
  options,
  onChange,
  className = "",
}) => {
  return (
    <div className={`${styles.dropdown} ${className}`}>
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownFilter;
