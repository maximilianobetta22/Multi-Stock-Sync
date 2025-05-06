import SideBar from "../Components/SideBar/SideBar";
import Navbar from "../Components/Navbar/NavbarSync";
import styles from "./LayoutSync.module.css";
import { UserProvider } from "../Context/UserContext";
import { StockNotification } from "../Components/StockNotification";

interface LayoutAppProps {
  children: React.ReactNode;
}

function LayoutApp({ children }: LayoutAppProps) {
  return (
    <UserProvider>
      <section className={styles.container}>
        <StockNotification />
        <Navbar />
        <SideBar />
        <div className={styles.children__container}>{children}</div>
      </section>
    </UserProvider>
  );
}

export default LayoutApp;
