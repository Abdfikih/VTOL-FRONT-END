import React, { useEffect, useState } from "react";
import ParagraphView from "./components/ParagraphView";
import { Stack, Typography, Grid, Card, CardHeader, CardContent, IconButton, Box, Input } from "@mui/material";
import logo from "../logo_0.png";
import moment from "moment/moment";
import { Canvas, useFrame, useThree } from "react-three-fiber";
import { Physics, usePlane, useBox } from "@react-three/cannon";
import Button from "@mui/material/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import image1 from "../DRONE2.jpeg";
import image2 from "../DRONE4.jpg";
import image3 from "../DRONE5.jpg";

function Plane(props) {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    ...props,
  }));
  return (
    <mesh receiveShadow ref={ref}>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial color="#000" />
    </mesh>
  );
}

function Cube() {
  const [attitude, setAttitude] = useState({
    yaw: 0.0,
    pitch: 0.0,
    roll: 0.0,
  });
  const [position, setPosition] = useState([0, 0.5, 0]);
  const [rotation, setRotation] = useState([attitude.yaw, attitude.pitch, attitude.roll]);
  const { clock } = useThree();

  useFrame((state, delta) => {
    setAttitude((prevAttitude) => ({
      yaw: prevAttitude.yaw + 0.01,
      pitch: prevAttitude.pitch + 0.01,
      roll: prevAttitude.roll + 0.01,
    }));
    setRotation([attitude.yaw, attitude.pitch, attitude.roll]);
    setPosition([0, Math.sin(clock.getElapsedTime()), 0]);
  });

  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry />
      <meshStandardMaterial color="#BA365D" />
    </mesh>
  );
}

const About = () => {
  moment.locale("id");
  const [hoursTime, setHoursTime] = useState("");
  const [daysTime, setDaysTime] = useState("");

  const [hoverDashboard, setHoverDashboard] = useState(false);
  const [hoverAbout, setHoverAbout] = useState(false);
  const [hoverControls, setHoverControls] = useState(false);

  const handleDashboardHover = () => setHoverDashboard(!hoverDashboard);
  const handleAboutHover = () => setHoverAbout(!hoverAbout);
  const handleControlsHover = () => setHoverControls(!hoverControls);

  useEffect(() => {
    const interval = setInterval(() => {
      setHoursTime(moment().format("H:mm:ss"));
      setDaysTime(moment().format("ddd, DD MMMM YYYY"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Stack direction={"row"} gap={"30px"}>
      <Stack flexBasis={"25%"} width={"80%"} maxWidth={"25%"} alignItems="center" gap="10px" sx={{ background: "#000000", height: "100vh", padding: "30px" }}>
        <img src={logo} alt="Logo" width="120px" />

        <Typography>{hoursTime}</Typography>
        <Typography>{daysTime}</Typography>
        <Stack direction={"column"} padding="20px" gap="20px"></Stack>
        <Stack direction="column" spacing={1}>
          <Button
            onMouseEnter={handleDashboardHover}
            onMouseLeave={handleDashboardHover}
            style={{
              color: hoverDashboard ? "#6841b0" : "white",
              fontSize: 20,
            }}
            href="/"
          >
            Dashboard
          </Button>
          <Button
            onMouseEnter={handleAboutHover}
            onMouseLeave={handleAboutHover}
            style={{
              color: hoverAbout ? "#6841b0" : "white",
              fontSize: 20,
            }}
            href="/About"
          >
            About
          </Button>
          <Button
            onMouseEnter={handleControlsHover}
            onMouseLeave={handleControlsHover}
            style={{
              color: hoverControls ? "#6841b0" : "white",
              fontSize: 20,
            }}
            href="/Controls"
          >
            Controls
          </Button>
        </Stack>
        <Stack direction={"column"} padding="20px" gap="0px"></Stack>

        <Canvas dpr={[1, 2]} shadows camera={{ position: [-5, 5, 5], fov: 18 }}>
          <ambientLight />
          <spotLight angle={0.25} penumbra={0.5} position={[10, 10, 3]} castShadow />
          <Physics allowSleep={true}>
            <Plane />
            <Cube />
          </Physics>
        </Canvas>
      </Stack>

      <Box flexBasis={"100%"} width={"100%"} sx={{ overflowY: "scroll", maxHeight: "100vh" }}>
        <Typography
          sx={{
            color: "#BA365D",
            fontSize: "30px",
            margin: "20px auto",
            fontWeight: "bold",
          }}
          textAlign="center"
        >
          About Cigritous
        </Typography>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Stack direction={"row"} gap={"20px"}>
            <img src={image1} alt="Image 1" width="300px" style={{ borderRadius: "50%", border: "5px solid #3D3356" }} />
            <img src={image2} alt="Image 2" width="300px" style={{ borderRadius: "50%", border: "5px solid #3D3356" }} />
            <img src={image3} alt="Image 3" width="300px" style={{ borderRadius: "50%", border: "5px solid #3D3356" }} />
          </Stack>
        </div>
        <div>
          <ParagraphView text="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." />
        </div>
      </Box>
    </Stack>
  );
};

export default About;

// const PageNotFound = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   const toggle = () => {
//     setIsOpen(!isOpen);
//   };
//   return (
//     <div>
//       <ParagraphView text="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." />
//     </div>

//     // <div className={`${isOpen ? "fixed h-screen w-full" : ""} flex flex-col min-h-screen min-w-[300px]`}>
//     //   <div className="flex mx-20">
//     //     <Drone />
//     //   </div>
//     // </div>
//   );
// };
// export default PageNotFound;
