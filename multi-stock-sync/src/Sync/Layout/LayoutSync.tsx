import SideBar from '../Components/SideBar/SideBar';
import Navbar from '../Components/Navbar/NavbarSync';
import styles from './LayoutSync.module.css';


interface LayoutAppProps {
  children: React.ReactNode;
};

function LayoutApp({children}: LayoutAppProps) {

  return (
    <section className={styles.container}>
      <Navbar/>
      <SideBar/>
      <div className={styles.children__container}>
        {children}
      </div>
    </section>
  );
};

export default LayoutApp;