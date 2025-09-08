import React from "react";
import styles from "./About.module.css";

const teamMembers = [
  {
    name: "Marcos Reyes",
    role: "Fundador de proyecto, desarrollador FullStack.",
    img: "https://github.com/astronautMarkus.png",
  },
  {
    name: "Nicolás Herández",
    role: "Desarrollador Front-end.",
    img: "https://github.com/NSHN1999.png",
  },
  {
    name: "Bryan Ancaye",
    role: "Desarrollador Front-end.",
    img: "https://github.com/Bryan747474.png",
  },
  {
    name: "Gary Villegas",
    role: "Desarrollador FullStack.",
    img: "https://github.com/GaryVillegas.png",
  },
  {
    name: "Abraham Daque",
    role: "Desarrollador Front-end.",
    img: "https://github.com/Abraham09123409.png",
  },
  {
    name: "Kris Pienaar",
    role: "Desarrollador Front-end.",
    img: "https://github.com/KrisPieChicken.png",
  },
  {
    name: "Felipe Henríquez",
    role: "Desarrollador Front-end.",
    img: "https://github.com/F3lip3-xz.png",
  },
  {
    name: "Pablo Osses",
    role: "Desarrollador Front-end.",
    img: "https://github.com/PabloOsses.png",
  },
  {
    name: "Dependabot[bot]",
    role: "Nuestro confiable amigo robótico.",
    img: "https://pbs.twimg.com/profile_images/1131474981991452672/C1GR1yFE_400x400.png",
  },
  {
    name: "Kiara Rubio",
    role: "Desarrolladora FullStack.",
    img: "https://github.com/Ki4ra1109.png",
  },
  {
    name: "Adolfo Venegas",
    role: "Desarrollador Back-end.",
    img: "https://github.com/4d0lf00.png",
  },
  {
    name: "Sebastián Jeldres",
    role: "Desarrollador Back-end.",
    img: "https://github.com/SebaJeldres.png",
  },
  {
    name: "Isaac Monsalve",
    role: "Desarrollador Back-end.",
    img: "https://avatars.githubusercontent.com/u/169402235?v=4",
  },
  {
    name: "Francisca Arredondo",
    role: "Desarrollador Front-end.",
    img: "https://avatars.githubusercontent.com/u/205383671?v=4",
  },
  {
    name: "Emerson Lemunao",
    role: "Desarrollador Front-end.",
    img: "https://avatars.githubusercontent.com/u/151589937?v=4",
  },
  {
    name: "Daniel Órdenes",
    role: "Desarrollador Back-end.",
    img: "https://avatars.githubusercontent.com/u/50424623?v=4",
  },
  {
    name: "Fanny Araujo",
    role: "Desarrollador Back-end.",
    img: "https://avatars.githubusercontent.com/u/134561771?v=4",
  },
  {
    name: "Lian Venegas",
    role: "Desarrollador Front-end.",
    img: "https://avatars.githubusercontent.com/u/198663972?=4",
  },
  {
    name: "Daniel Campos",
    role: "Desarrollador Front-end.",
    img: "https://avatars.githubusercontent.com/u/102598967?v=4",
  },
{
    name: "Ignacio ",
    role: "Desarrollador Front-end.",
    img: "https://avatars.githubusercontent.com/u/135282759?v=4",
  },

];


const About: React.FC = () => {
  return (
    <div className={`container ${styles.aboutContainer}`}>
      <h1 className="text-center mt-5">Sobre el Proyecto: Multi-Stock-Sync</h1>
      <p className="text-center text-muted">
        Multi-Stock-Sync está diseñado para sincronizar datos de stock a través
        de múltiples plataformas, cuentas de MercadoLibre, utilizando su API.
        También puede realizar reportes gráficos sobre ventas y métricas
        variables.
      </p>
      <h2 className="text-center mt-4">Miembros del Equipo</h2>
      <div className="row justify-content-center mt-4">
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className="col-md-3 col-sm-6 text-center"
            style={
              { "--animation-delay": `${index * 0.2}s` } as React.CSSProperties
            }
          >
            <div className={styles.memberContainer}>
              <img
                src={member.img}
                alt={member.name}
                className={`${styles.memberImage} rounded-circle`}
              />
              <h5 className={styles.memberName}>{member.name}</h5>
              <p className={styles.memberRole}>{member.role}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-5 mb-5">
        <p className="text-muted">
          A todos los miembros presentes y anteriores, gracias por su arduo
          trabajo y dedicación. ¡Juntos hemos logrado grandes cosas y seguiremos
          alcanzando nuevas metas!
        </p>
        <strong>-Markus</strong>
      </div>
    </div>
  );
};

export default About;
