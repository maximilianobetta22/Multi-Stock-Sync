import RouterApp from "./router/RouterApp";
import ChatBotAyuda from "./components/ChatBotAyuda"; // 👈 Importamos el bot

function App() {
  return (
    <>
      <RouterApp />
      <ChatBotAyuda /> {/* 👈 Agregamos el bot aquí */}
    </>
  );
}

export default App;
