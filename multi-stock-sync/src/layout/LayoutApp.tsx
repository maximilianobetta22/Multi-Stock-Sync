import { JSX } from "react";
import Navbar from "../Sync/Components/Navbar/NavbarSync";
import styles from "./LayoutApp.module.css";

interface LayoutAppProps {
  children: JSX.Element;
}

function LayoutApp({ children }: LayoutAppProps) {
  return (
    <>
      <Navbar />
      <div className={styles.container}>{children}</div>
    </>
  );
}

export default LayoutApp;
