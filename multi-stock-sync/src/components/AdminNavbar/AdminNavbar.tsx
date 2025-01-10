import { navLinksDocuments, navLinksStock, navLinksReports } from './data/LinksData';
import styles from './AdminNavbar.module.css';
import { useEffect, useState } from 'react';
import { useLocation, NavLink } from 'react-router-dom';

interface NavigateLink {
  name: string;
  url?: string;
  options?: {
    name: string;
    url?: string;
  }[];
};

const AdminNavbar = () => {

  const { pathname } = useLocation();

  const [activeLinks, setActiveLinks] = useState<NavigateLink[]>([]);

  const handleNavLinks = () => {
    if (pathname.includes('/admin/documentos')) {
      setActiveLinks(navLinksDocuments)
    } else if (pathname.includes('/admin/stock')) {
      setActiveLinks(navLinksStock)
    } else if (pathname.includes('/admin/reportes')) {
      setActiveLinks(navLinksReports)
    }
  };

  useEffect(() => {
    handleNavLinks();
  }, [pathname]);

  return (
    <nav className={styles.miniNavBar}>
      <ul className={styles.links__miniNavBar}>
        {
          activeLinks.map((link) => (
            <div key={link.name} className='dropdown'>
              <NavLink
                data-bs-toggle="dropdown" aria-expanded="false"
                className={({ isActive }) => `${(link.options!) ? 'dropdown-toggle' : ''} ${styles.link__links} ${(isActive) ? styles.linkActive__Links : ''}`}
                to='/'
              >
                {link.name}
              </NavLink>
              <ul className={`${(link.options!) ? `dropdown-menu ${styles.subLinks__link}` : ''}`}>
                {
                  link.options?.map((option) => (
                    <button key={option.name} className={`dropdown-item ${styles.btn__subLinks}`}>
                      <NavLink
                        className={styles.sublink__subLinks}
                        type='button'
                        to={option.url!}
                      >
                        {option.name}
                      </NavLink>
                    </button>
                  ))
                }
              </ul>
            </div>
          ))
        }
      </ul>
    </nav>
  );
};

export default AdminNavbar;