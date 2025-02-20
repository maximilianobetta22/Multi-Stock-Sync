import SideBar from '../Components/SideBar/SideBar';
import Navbar from '../Components/Navbar/NavbarSync';
import styles from './LayoutSync.module.css';
import { UserProvider } from '../Context/UserContext';

interface LayoutAppProps {
  children: React.ReactNode;
};

function LayoutApp({children}: LayoutAppProps) {

  return (
    <UserProvider>
      <section className={styles.container}>
        <Navbar/>
        <SideBar/>
        <div className={styles.children__container}>
          {children}
        </div>
      </section>
    </UserProvider>
  );
};

export default LayoutApp;