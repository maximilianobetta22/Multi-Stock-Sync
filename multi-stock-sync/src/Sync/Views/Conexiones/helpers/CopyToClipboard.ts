import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const copyToClipboard = (token: string, message: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(token).then(() => {
      MySwal.fire({
        title: 'Éxito',
        text: message,
        icon: 'success'
      });
    }).catch(err => console.error("Error al copiar el token:", err));
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = token;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      MySwal.fire({
        title: 'Éxito',
        text: message,
        icon: 'success'
      });
    } catch (err) {
      console.error("Error al copiar el token:", err);
    }
    document.body.removeChild(textArea);
  }
};