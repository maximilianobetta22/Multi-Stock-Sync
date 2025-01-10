import Navbar from '../Components/Navbar/Navbar';
import styles from './LayoutApp.module.css';

interface LayoutAppProps {
  children: JSX.Element;
};

function LayoutApp({children}: LayoutAppProps) {

  return (
    <>
      <Navbar/>
      <div className={styles.container}>
        {children}
      </div>
    </>
  );
};

export default LayoutApp;