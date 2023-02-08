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

const CorCard = ({ title, value, handleCardHover, hoverCard }) => {
  return (
    <Card
      onMouseEnter={handleCardHover}
      onMouseLeave={handleCardHover}
      style={{
        backgroundColor: "#000000",
        boxShadow: hoverCard ? "0px 0px 20px 0px #000000" : "none",
      }}
    >
      <CardHeader title={title} style={{ backgroundColor: "#312945", textAlign: "center" }} />
      <CardContent
        style={{
          backgroundColor: "#3D3356",
          minHeight: "80px",
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <Typography variant="h4">{value}</Typography>
      </CardContent>
    </Card>
  );
};

const NodeCard = ({ title, value, handleCardHover, hoverCard }) => {
  return (
    <Card
      onMouseEnter={handleCardHover}
      onMouseLeave={handleCardHover}
      style={{
        backgroundColor: "#000000",
        boxShadow: hoverCard ? "0px 0px 20px 0px #000000" : "none",
      }}
    >
      <CardHeader title={title} style={{ backgroundColor: "#312945", textAlign: "center" }} />
      <CardContent
        style={{
          backgroundColor: "#3D3356",
          minHeight: "140px",
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <Typography variant="h4">{value}</Typography>
      </CardContent>
    </Card>
  );
};

// const handleTakeOff = () => {
//   // const client = mqtt.connect("wss://driver.cloudmqtt.com:1884", options);
//   // client.on(
//   //   "connect",
//   //   () => {
//   //     console.log("MQTT client connected to the server.");
//   //     client.publish("/drone/take_land", String(1), { qos: 0 });
//   //     return () => client.end();
//   //   },
//   //   []
//   // );
// };

// const handleLanding = () => {
//   // const client = mqtt.connect("wss://driver.cloudmqtt.com:1884", options);
//   // client.on(
//   //   "connect",
//   //   () => {
//   //     console.log("MQTT client connected to the server.");
//   //     client.publish("/drone/take_land", String(0), { qos: 0 });
//   //     return () => client.end();
//   //   },
//   //   []
//   // );
// };

const Controls = () => {
  moment.locale("id");
  const [hoursTime, setHoursTime] = useState("");
  const [daysTime, setDaysTime] = useState("");
  const [droneTakeLand, setDroneTakeLand] = useState("");
  const [mapsFlight, setMapsFlight] = useState([]);
  const [droneFlightLtd, setDroneFlightLtd] = useState([]);
  const [droneFlightLng, setDroneFlightLng] = useState([]);
  const [droneStatus, setDroneStatus] = useState([]);
  const [droneBattery, setDroneBattery] = useState([]);
  const [droneAltitude, setDroneAltitude] = useState([]);
  const [droneSpeedX, setDroneSpeedX] = useState([]);
  const [droneSpeedY, setDroneSpeedY] = useState([]);
  const [droneSpeedZ, setDroneSpeedZ] = useState([]);
  const [droneProgress, setDroneProgress] = useState([]);
  const [droneHeading, setDroneHeading] = useState([]);
  const [droneTimestamp, setDroneTimeStamp] = useState([]);

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
    const client = mqtt.connect("wss://driver.cloudmqtt.com:1884", options);
    client.on("connect", () => {
      console.log("MQTT client connected to the server.");
      client.subscribe("/drone/lat");
      client.subscribe("/drone/lng");
      client.subscribe("/drone/alt");
      client.subscribe("/drone/vx");
      client.subscribe("/drone/vy");
      client.subscribe("/drone/vz");
      client.subscribe("/drone/yaw_curr");
      client.subscribe("/drone/time");
      for (let i = 1; i <= 20; i++) {
        client.subscribe("/" + i + "/coordinate");
      }
    });

    console.log("masuk config");
    client.on("message", (topic, message) => {
      console.log("tessss");
      if (topic === "/drone/lat") {
        setDroneFlightLtd(message.toString());
      }
      if (topic === "/drone/lng") {
        setDroneFlightLng(message.toString());
      }
      if (topic === "/drone/alt") {
        setDroneAltitude(message.toString());
      }
      if (topic === "/drone/vx") {
        setDroneSpeedX(message.toString());
      }
      if (topic === "/drone/vy") {
        setDroneSpeedY(message.toString());
      }
      if (topic === "/drone/vz") {
        setDroneSpeedZ(message.toString());
      }
      if (topic === "/drone/yaw_curr") {
        setDroneHeading(message.toString());
      }
      if (topic === "/drone/time") {
        setDroneTimeStamp(message.toString());
      }
      for (let i = 1; i <= 20; i++) {
        if (topic === "/" + i + "/coordinate") {
          arrCoor[i - 1] = JSON.parse(message);
          setMapsFlight(arrCoor);
        }
      }
    });
    return () => {
      client.end();
    };
  }, [mapsFlight]);

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
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              onMouseEnter={() => handleCardHover(6)}
              onMouseLeave={() => handleCardHover(6)}
              style={{ backgroundColor: "#3D3356", color: "white", padding: "10px 30px", border: "none", boxShadow: hoverCard[6] ? "0px 0px 20px 0px #000000" : "none" }}
              onClick={true}
            >
              Take Off Drone
            </button>
            <Card
              onMouseEnter={() => handleCardHover(8)}
              onMouseLeave={() => handleCardHover(8)}
              style={{ backgroundColor: "#3D3356", color: "white", padding: "10px 30px", border: "none", boxShadow: hoverCard[8] ? "0px 0px 20px 0px #000000" : "none" }}
            >
              Task Progress : {droneProgress}%{" "}
            </Card>
            <button
              onMouseEnter={() => handleCardHover(7)}
              onMouseLeave={() => handleCardHover(7)}
              style={{ backgroundColor: "#3D3356", color: "white", padding: "10px 30px", border: "none", boxShadow: hoverCard[7] ? "0px 0px 20px 0px #000000" : "none" }}
              onClick={true}
            >
              Landing Drone
            </button>
          </div>
          <Stack direction={"column"} padding="10px" gap="10px"></Stack>
        </Stack>
        <Stack direction={"column"} padding="20px" gap="10px">
          <CorCard title="Coordinate Position Drone" value={"Lat : " + droneFlightLtd + " || Lng : " + droneFlightLng} handleCardHover={() => handleCardHover(3)} hoverCard={hoverCard[3]} />
          <Stack direction={"column"} padding="20px" gap="10px">
            <Grid container spacing={2} columns={3} width="100%" justifyContent={"center"}>
              <Grid item xs={1}>
                <NodeCard title="Status Drone" value={droneStatus} handleCardHover={() => handleCardHover(1)} hoverCard={hoverCard[1]} />
              </Grid>
              <Grid item xs={1}>
                <NodeCard title="Timestamp Drone" value={droneTimestamp} handleCardHover={() => handleCardHover(9)} hoverCard={hoverCard[9]} />
              </Grid>
              <Grid item xs={1}>
                <NodeCard title="Status Battery" value={droneBattery + " %"} handleCardHover={() => handleCardHover(2)} hoverCard={hoverCard[2]} />
              </Grid>
              <Grid item xs={1}>
                <NodeCard title="Altitude Drone" value={droneAltitude} handleCardHover={() => handleCardHover(3)} hoverCard={hoverCard[3]} />
              </Grid>
              <Grid item xs={1}>
                <NodeCard title="Heading Drone" value={droneHeading} handleCardHover={() => handleCardHover(10)} hoverCard={hoverCard[10]} />
              </Grid>
            </Grid>
            <Stack direction={"column"} padding="20px" gap="10px">
              <Grid container spacing={2} columns={3} width="100%" justifyContent={"center"}>
                <Grid item xs={1}>
                  <NodeCard title="Speed Drone (X)" value={droneSpeedX} handleCardHover={() => handleCardHover(4)} hoverCard={hoverCard[4]} />
                </Grid>
                <Grid item xs={1}>
                  <NodeCard title="Speed Drone (Y)" value={droneSpeedY} handleCardHover={() => handleCardHover(10)} hoverCard={hoverCard[10]} />
                </Grid>
                <Grid item xs={1}>
                  <NodeCard title="Speed Drone (Z)" value={droneSpeedZ} handleCardHover={() => handleCardHover(11)} hoverCard={hoverCard[11]} />
                </Grid>
              </Grid>
            </Stack>
          </Stack>
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
