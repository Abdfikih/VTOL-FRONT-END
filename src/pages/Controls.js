import React, { useEffect, useState } from "react";
import { Stack, Typography, Grid, Card, CardHeader, CardContent, IconButton, Box, Input } from "@mui/material";
import logo from "../logo_0.png";
import moment from "moment/moment";
import { Canvas, useFrame, useThree } from "react-three-fiber";
import { Physics, usePlane, useBox } from "@react-three/cannon";
import axios from "axios";
import GoogleMapReact from "google-map-react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import { MDBContainer } from "mdbreact";
import Button from "@mui/material/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import mqtt from "mqtt/dist/mqtt";

var options = {
  port: 38789,
  host: "wss://driver.cloudmqtt.com",
  clientId: "mqttjs_" + Math.random().toString(16).substr(2, 8),
  username: "cbobzrgp",
  password: "CKvOQLxrtuqc",
};

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

const LocationPin = ({ text, color }) => (
  <IconButton sx={{ display: "inline-block", transform: "none", transform: "translate(-50%, -50%)" }}>
    <LocationOnIcon sx={{ color: color }} />
    <Typography component="p" sx={{ color: color }}>
      {text}
    </Typography>
  </IconButton>
);

const Controls = () => {
  moment.locale("id");
  const [hoursTime, setHoursTime] = useState("");
  const [daysTime, setDaysTime] = useState("");
  const [mapsFlight, setMapsFlight] = useState([]);
  let arrCoor = [...mapsFlight];

  let totalNode = 20;

  const nodes = [];

  for (let index = 1; index <= totalNode; index++) {
    nodes.push(index);
  }

  const [hoverCard, setHoverCard] = useState(Array(nodes.length).fill(false));
  const [hoverDashboard, setHoverDashboard] = useState(false);
  const [hoverSettings, setHoverSettings] = useState(false);
  const [hoverControls, setHoverControls] = useState(false);

  const handleDashboardHover = () => setHoverDashboard(!hoverDashboard);
  const handleSettingsHover = () => setHoverSettings(!hoverSettings);
  const handleControlsHover = () => setHoverControls(!hoverControls);

  const handleCardHover = (index) => {
    const newHoverCard = [...hoverCard];
    newHoverCard[index] = !newHoverCard[index];
    setHoverCard(newHoverCard);
  };

  const [attitude, setAttitude] = useState({
    yaw: 0.0,
    pitch: 0.0,
    roll: 0.0,
    att: 0.0,
    lat: -6.365232,
    lng: 106.824506,
  });
  const [titik, setTitik] = useState(0);

  const defaultProps = {
    center: {
      lat: attitude.lat,
      lng: attitude.lng,
    },
    zoom: 18,
    options: {
      disableDefaultUI: true,
      dragging: false,
      scrollwheel: false,
      panControl: false,
      zoomControl: false,
      gestureHandling: "none",
    },
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setHoursTime(moment().format("H:mm:ss"));
      setDaysTime(moment().format("ddd, DD MMMM YYYY"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const client = mqtt.connect("wss://driver.cloudmqtt.com:1884", options);

  useEffect(() => {
    console.log("masuk config");
    client.on("message", (topic, message) => {
      console.log("tessss");
      for (let i = 1; i <= 20; i++) {
        if (topic === "/" + i + "/coordinate") {
          arrCoor[i - 1] = JSON.parse(message);
          setMapsFlight(arrCoor);
        }
      }
    });
    for (let i = 1; i <= 20; i++) {
      client.subscribe("/" + i + "/coordinate");
    }

    return () => {
      for (let i = 1; i <= 20; i++) {
        client.unsubscribe("/" + i + "/coordinate");
      }
    };
  }, [mapsFlight]);

  useEffect(() => {
    client.on("connect", () => {
      console.log("MQTT client connected to the server.");
    });
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
            onMouseEnter={handleSettingsHover}
            onMouseLeave={handleSettingsHover}
            style={{
              color: hoverSettings ? "#6841b0" : "white",
              fontSize: 20,
            }}
            href="/Settings"
          >
            Settings
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
          Controls Unnamed Drone
        </Typography>
        <Stack direction={"column"} padding="20px" gap="20px">
          <Stack style={{ height: "50vh", width: "100%" }}>
            <GoogleMapReact
              bootstrapURLKeys={{
                key: "AIzaSyD3RzE2fq7JvhFmDTbXyjj22jqIAytT7XU",
                language: "id",
              }}
              defaultCenter={defaultProps.center}
              defaultZoom={defaultProps.zoom}
            >
              <LocationPin lat={defaultProps.center.lat} lng={defaultProps.center.lng} text="Drone" color="red" />
              {mapsFlight?.map((data, idx) => (
                <LocationPin lat={data.lat} lng={data.lng} text={`Terbang ke-${idx + 1}`} color="yellow" />
              ))}
            </GoogleMapReact>
          </Stack>
          <Stack direction={"column"} padding="10px" gap="10px"></Stack>
        </Stack>
      </Box>
    </Stack>
  );
};

export default Controls;

// const MqttClient = () => {
//   const [droneStatus, setDroneStatus] = useState({});
//   const [dronePosition, setDronePosition] = useState({});
//   const [droneBattery, setDroneBattery] = useState(0);

//   useEffect(() => {
//     const client = mqtt.connect("wss://driver.cloudmqtt.com:1884", options);

//     client.on(
//       "connect",
//       () => {
//         client.subscribe("drone/status");
//         client.on("message", (topic, message) => {
//           if (topic === "drone/status") {
//             setDroneStatus(JSON.parse(message));
//           }
//         });

//         client.subscribe("drone/position");
//         client.on("message", (topic, message) => {
//           if (topic === "drone/position") {
//             setDronePosition(JSON.parse(message));
//           }
//         });

//         client.subscribe("drone/battery");
//         client.on("message", (topic, message) => {
//           if (topic === "drone/battery") {
//             setDroneBattery(message);
//           }
//         });
//         return () => {
//           client.end();
//         };
//       },
//       []
//     );
//   }, []);

//   return (
//     <div>
//       <div className="flex mx-20">{<Drone />}</div>
//       {/* <Typography
//         sx={{
//           color: "#BA365D",
//           fontSize: "30px",
//           margin: "20px auto",
//           fontWeight: "bold",
//         }}
//         textAlign="center"
//       >
//         Drone Status: {droneStatus}
//       </Typography>
//       <Typography
//         sx={{
//           color: "#BA365D",
//           fontSize: "30px",
//           margin: "20px auto",
//           fontWeight: "bold",
//         }}
//         textAlign="center"
//       >
//         Drone Position: {dronePosition}
//       </Typography>

//       <Typography
//         sx={{
//           color: "#BA365D",
//           fontSize: "30px",
//           margin: "20px auto",
//           fontWeight: "bold",
//         }}
//         textAlign="center"
//       >
//         Drone Battery: {droneBattery}%
//       </Typography> */}
//     </div>
//   );
// };
// export default MqttClient;
