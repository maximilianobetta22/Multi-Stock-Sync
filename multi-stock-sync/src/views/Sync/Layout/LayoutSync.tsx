import SideBar from '../Components/SideBar/SideBar';
import styles from './LayoutSync.module.css';

interface LayoutAppProps {
  children: JSX.Element;
};

function LayoutApp({children}: LayoutAppProps) {

  return (
    <section className={styles.container}>
      <SideBar/>
      <div className={styles.children__container}>
        {children}
      </div>
    </section>
  );
};

export default LayoutApp;