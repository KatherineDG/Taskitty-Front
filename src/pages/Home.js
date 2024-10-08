import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Home.css";
import Navegacion from "../components/Navegacion";
import Espacios from "../components/Espacios";
import Tableros from "../components/Tableros";

import getUsuario from "../api/getUsuario.api";
import postEquipo from "../api/postEquipo.api";
import ModalAltaTablero from "../components/ModalAltaTablero";
import postTableroEquipo from "../api/postTableroEquipo.api";
import postTableroEspacio from "../api/postTableroEspacio.api";
import ModalAltaEquipo from "../components/ModalAltaEquipo";


function Home() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState({});
  const [nombreEspacio, setNombreEspacio] = useState(`Espacio de ${usuario.nombre}`);
  const [listaEquipos, setListaEquipos] = useState([]);
  const [listaTableros, setListaTableros] = useState([]);
  const [mostrarModalAltaTablero, setMostrarModalAltaTablero] = useState(false);
  const [mostrarModalAltaEquipo, setMostrarModalAltaEquipo] = useState(false);
  const [listaInvitaciones, setListaInvitaciones] = useState([]);
  const [hayInvitaciones, setHayInvitaciones] = useState(false);

  const handleNombreEspacio = (nombreEspacio) => {
    console.log("Nombre de espacio:", nombreEspacio);
    setNombreEspacio(nombreEspacio);
    if (nombreEspacio !== `Espacio de ${usuario.nombre}`) {
      usuario.equipos.map((equipo) => {
        if (equipo.nombre === nombreEspacio)
          setListaTableros(equipo.tableros);
      });
    } else {
      setListaTableros(usuario.espacio);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("userId") === null) {
    const fetchUsuario = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("userId");

        if (userId) {
            localStorage.setItem("userId", userId);
            console.log("ID de usuario guardado:", userId);

            try {
                const user = await getUsuario(userId);
                //localStorage.setItem("user", user);
                setUsuario(user);
                setNombreEspacio(`Espacio de ${user.nombre}`);
                setListaTableros(user.espacio);
                setListaEquipos(user.equipos);
                const invitaciones = user.invitaciones;
                setListaInvitaciones(invitaciones);
                if(invitaciones.length > 0){
                  setHayInvitaciones(true)
                } else{
                  setHayInvitaciones(false)
                }

                // Guardar la cadena JSON en localStorage
                localStorage.setItem("usuario", JSON.stringify(user));
            } catch (error) {
                console.error("Error al obtener el usuario:", error);
                navigate('/error');  // Redirige si ocurre un error
            }
        } else {
            navigate('/error');  // Redirige si no se encuentra el ID del usuario
        }
    };
    fetchUsuario();
}
else {          
          
  const fetchUsuarioLS = async () => {
      const userId = localStorage.getItem("userId");
              const user = await getUsuario(userId);
                //localStorage.setItem("user", user);
                setUsuario(user);
                setNombreEspacio(`Espacio de ${user.nombre}`);
                setListaTableros(user.espacio);
                setListaEquipos(user.equipos);
                const invitaciones = user.invitaciones;
                setListaInvitaciones(invitaciones);
                if(invitaciones.length > 0){
                  setHayInvitaciones(true)
                } else{
                  setHayInvitaciones(false)
                }

                localStorage.setItem("usuario", JSON.stringify(user));
  };
  fetchUsuarioLS();
          }
                }, [navigate]);


  const handleMostrarModalAltaTablero = () => {
    setMostrarModalAltaTablero(true);
  };

  const handleCerrarModalAltaTablero = () => {
    setMostrarModalAltaTablero(false);
  };

  const altaTableroAPI = async (nombreTablero) => {
    if(nombreEspacio !== `Espacio de ${usuario.nombre}`) {
      try {
        const response = await postTableroEquipo(usuario._id, nombreEspacio, nombreTablero);
        console.log("Respuesta de alta de tablero:", response.message);
        if (response.message === "Tablero creado") {
            window.location.reload();
        }
      } catch (error) {
        console.error("Error al dar de alta el tablero:", error);
      }
    } else {
      try {
        const response = await postTableroEspacio(usuario._id, nombreTablero);
        console.log("Respuesta de alta de tablero:", response.message);
        if (response.message === "Tablero creado") {
            window.location.reload();
        }
      } catch (error) {
        console.error("Error al dar de alta el tablero:", error);
      }
    }
  };

  
    const abrirModalAltaEquipo = () => {
      setMostrarModalAltaEquipo(true);
  }

  const cerrarModalAltaEquipo = () => {
      setMostrarModalAltaEquipo(false);
  }

  const altaEquipoAPI = async (nombreEquipo, invitados) => {
    console.log(usuario._id, nombreEquipo, invitados)
    try {
        const response = await postEquipo(usuario._id, nombreEquipo, invitados);
        console.log("Respuesta de alta de equipo:", response.message);
        if (response.message === "Equipo creado") {
           window.location.reload();
        }
    } catch (error) {
        console.error("Error al dar de alta el equipo:", error);
    }
}

  return (
    <div>
      {mostrarModalAltaTablero ? <ModalAltaTablero handleCerrarModalAltaTablero={handleCerrarModalAltaTablero} altaTableroAPI={altaTableroAPI}/> : null}
      {mostrarModalAltaEquipo ? <ModalAltaEquipo cerrarModalAltaEquipo={cerrarModalAltaEquipo} altaEquipoAPI={altaEquipoAPI}/> : null}
      <Navegacion listaInvitaciones={listaInvitaciones} hayInvitaciones={hayInvitaciones} fotoPerfil={usuario.foto} />
      <div className="home">
        <Espacios
          nombreUsuario={usuario.nombre}
          listaEquipos={listaEquipos}
          handleNombreEspacio={handleNombreEspacio}
          abrirModalAltaEquipo={abrirModalAltaEquipo}
        />
        <Tableros
          listaTablerosPersonal={listaTableros}
          nombreEspacio={nombreEspacio}
          nombreUsuario={usuario.nombre}
          handleMostrarModalAltaTablero={handleMostrarModalAltaTablero}
          listaEquipos={listaEquipos}
        />
      </div>
    </div>
  );
}

export default Home;
