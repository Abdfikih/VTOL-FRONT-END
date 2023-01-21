import React, { useEffect, useState } from "react";
import { Stack, Typography, Grid, Card, CardHeader, CardContent, IconButton, Box, Input } from "@mui/material";
import logo from "../logo_0.png";
import moment from "moment/moment";
import { Canvas } from "@react-three/fiber";
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
  port: 18789,
  // host: "mqtt://driver.cloudmqtt.com",
  clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
  username: 'cbobzrgp',
  password: 'CKvOQLxrtuqc',
  // keepalive: 60,
  // reconnectPeriod: 1000,
  // protocolId: 'MQIsdp',
  // protocolVersion: 3,
  // clean: true,
  // encoding: 'utf8'
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

function Cube(props) {
  const [attitude, setAttitude] = useState({
    yaw: 0.0,
    pitch: 0.0,
    roll: 0.0,
  });
  const [ref, setRef] = useState({ mass: 1, ...props });
  const [position, setPosition] = useState([0, 0.5, 0]);
  const [rotation, setRotation] = useState([attitude.yaw, attitude.pitch, attitude.roll]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setAttitude((prevAttitude) => ({
  //       yaw: prevAttitude.yaw + 0.1,
  //       pitch: prevAttitude.pitch + 0.1,
  //       roll: prevAttitude.roll + 0.1,
  //     }));
  //     setRotation([attitude.yaw, attitude.pitch, attitude.roll]);
  //   }, 100);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <mesh castShadow ref={ref} position={position} rotation={rotation}>
      <boxGeometry />
      <meshStandardMaterial color="#BA365D" />
    </mesh>
  );
}

const LocationPin = ({ text, color }) => (
  <IconButton>
    <LocationOnIcon sx={{ color: color }} />
    <Typography component="p" sx={{ color: color }}>
      {text}
    </Typography>
  </IconButton>
);

const Home = () => {
  moment.locale("id");
  const [hoursTime, setHoursTime] = useState("");
  const [daysTime, setDaysTime] = useState("");
  const [mapsFlight, setMapsFlight] = useState([]);
  const [data, setData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [start, setStart] = useState(0);
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
    zoom: 19,
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setHoursTime(moment().format("H:mm:ss"));
      setDaysTime(moment().format("ddd, DD MMMM YYYY"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [centralTemp, setCentralTemp] = useState("");
  const [centralPress, setCentralPress] = useState("");
  const [centralHumid, setCentralHumid] = useState("");
  const [centralGas, setCentralGas] = useState("");
  const [nodeTemp, setNodeTemp] = useState("");
  const [nodeHumid, setNodeHumid] = useState("");
  const [nodeMoist, setNodeMoist] = useState("");

  useEffect(() => {
    const client = mqtt.connect("mqtt://driver.cloudmqtt.com", options);

    client.on("connect", () => {
      console.log("MQTT client connected to the server.");
      client.subscribe("central/temp");
      client.subscribe("central/press");
      client.subscribe("central/humid");
      client.subscribe("central/gas");
      console.log("tes");
      console.log(centralTemp);
      client.subscribe("node/temp");
      client.subscribe("node/humid");
      client.subscribe("node/moist");
    });

    client.on("message", (topic, message) => {

      console.log("tessss");
      console.log(centralGas);
      if (topic === "central/temp") {
        setCentralTemp(message.toString());
      } else if (topic === "central/press") {
        setCentralPress(message.toString());
      } else if (topic === "central/humid") {
        setCentralHumid(message.toString());
      } else if (topic === "central/gas") {
        setCentralGas(message.toString());
      } else if (topic === "node/temp") {
        setNodeTemp(message.toString());
      } else if (topic === "node/humid") {
        setNodeHumid(message.toString());
      } else if (topic === "node/moist") {
        setNodeMoist(message.toString());
      }
    });

    return () => {
      client.end();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get("https://back-end-vtol-ex.vercel.app/api/drone");
      setData(response.data);
      let lastElement = response.data.slice(-1)[0];
      setAttitude({
        yaw: lastElement.yaw,
        roll: lastElement.roll,
        pitch: lastElement.pitch,
        att: lastElement.alt,
        lat: lastElement.lat,
        lng: lastElement.lng,
      });
      if (data.length < 13) setStart(0);
      else setStart(data.length - 11);
      setLabels(
        data.slice(start, data.length).map((item) => {
          return moment(item.insertedAt).format("DD-MM-YYYY, h:mm:ss a");
        })
      );
      setDatasets([
        {
          label: "Yaw",
          fill: true,
          lineTension: 0.3,
          backgroundColor: "rgba(225, 204,230, .3)",
          borderColor: "rgb(205, 130, 158)",
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: "rgb(205, 130,1 58)",
          pointBackgroundColor: "rgb(255, 255, 255)",
          pointBorderWidth: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgb(0, 0, 0)",
          pointHoverBorderColor: "rgba(220, 220, 220,1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: data.slice(start, data.length).map((item) => {
            return item.yaw;
          }),
        },
        {
          label: "Pitch",
          fill: true,
          lineTension: 0.3,
          backgroundColor: "rgba(184, 185, 210, .3)",
          borderColor: "rgb(35, 26, 136)",
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: "rgb(35, 26, 136)",
          pointBackgroundColor: "rgb(255, 255, 255)",
          pointBorderWidth: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgb(0, 0, 0)",
          pointHoverBorderColor: "rgba(220, 220, 220, 1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: data.slice(start, data.length).map((item) => {
            return item.pitch;
          }),
        },
        {
          label: "Roll",
          fill: true,
          lineTension: 0.3,
          backgroundColor: "rgba(188, 210, 184, .3)",
          borderColor: "rgb(44, 136, 26)",
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: "rgb(44, 136, 26)",
          pointBackgroundColor: "rgb(255, 255, 255)",
          pointBorderWidth: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgb(0, 0, 0)",
          pointHoverBorderColor: "rgba(220, 220, 220, 1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: data.slice(start, data.length).map((item) => {
            return item.roll;
          }),
        },
      ]);
    };
    fetchData();
  }, [data, start]);
  const [hoverDashboard, setHoverDashboard] = useState(false);
  const [hoverSettings, setHoverSettings] = useState(false);
  const [hoverControls, setHoverControls] = useState(false);
  const [hoverCard1, setHoverCard1] = useState(false);
  const [hoverCard2, setHoverCard2] = useState(false);
  const [hoverCard3, setHoverCard3] = useState(false);
  const [hoverCard4, setHoverCard4] = useState(false);
  const [hoverCard5, setHoverCard5] = useState(false);
  const [hoverCard6, setHoverCard6] = useState(false);
  const [hoverCard7, setHoverCard7] = useState(false);

  const handleDashboardHover = () => setHoverDashboard(!hoverDashboard);
  const handleSettingsHover = () => setHoverSettings(!hoverSettings);
  const handleControlsHover = () => setHoverControls(!hoverControls);
  const handleCardHover1 = () => setHoverCard1(!hoverCard1);
  const handleCardHover2 = () => setHoverCard2(!hoverCard2);
  const handleCardHover3 = () => setHoverCard3(!hoverCard3);
  const handleCardHover4 = () => setHoverCard4(!hoverCard4);
  const handleCardHover5 = () => setHoverCard5(!hoverCard5);
  const handleCardHover6 = () => setHoverCard6(!hoverCard6);
  const handleCardHover7 = () => setHoverCard7(!hoverCard7);

  return (
    <Stack direction={"row"} gap={"30px"}>
      <Stack flexBasis={"25%"} width={"25%"} alignItems="center" gap="10px" sx={{ background: "#000000", height: "100vh", padding: "30px" }}>
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

        <Canvas dpr={[1, 2]} shadows camera={{ position: [-5, 5, 5], fov: 20 }}>
          <ambientLight />
          <spotLight angle={0.25} penumbra={0.5} position={[10, 10, 5]} castShadow />
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
          Dashboard Cigritous
        </Typography>
        <Box padding="20px">
          <Typography fontSize="10px">Banyaknya Titik Terbang Drone</Typography>
          <Input id="my-input" value={titik} sx={{ borderBottom: "1px solid #fffffff" }} onChange={(e) => setTitik(e.target.value)} />
        </Box>
        <Stack direction={"column"} padding="20px" gap="20px">
          <Stack style={{ height: "50vh", width: "100%" }}>
            <GoogleMapReact
              bootstrapURLKeys={{
                key: "AIzaSyD3RzE2fq7JvhFmDTbXyjj22jqIAytT7XU",
                language: "id",
              }}
              defaultCenter={defaultProps.center}
              defaultZoom={defaultProps.zoom}
              onClick={(e) => {
                if (mapsFlight.length < titik) {
                  let arr = [...mapsFlight];
                  arr.push({ lat: e.lat, lng: e.lng });
                  setMapsFlight(arr);
                }
              }}
            >
              <LocationPin lat={defaultProps.center.lat} lng={defaultProps.center.lng} text="Drone" color="red" />
              {mapsFlight?.map((data, idx) => (
                <LocationPin lat={data.lat} lng={data.lng} text={`Terbang ke-${idx + 1}`} color="gray" />
              ))}
            </GoogleMapReact>
          </Stack>
          <Grid container spacing={2} columns={3} width="100%" justifyContent={"center"}>
            <Grid item xs={1}>
              <Card
                onMouseEnter={handleCardHover1}
                onMouseLeave={handleCardHover1}
                sx={{ minHeight: "90px" }}
                style={{
                  backgroundColor: "#000000",
                  boxShadow: hoverCard1 ? "0px 0px 20px 0px #000000" : "none",
                }}
              >
                <CardHeader title="Temp Central" style={{ backgroundColor: "#312945", textAlign: "center" }} />
                <CardContent
                  style={{
                    backgroundColor: "#3D3356",
                    minHeight: "140px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <Typography variant="h4">{centralTemp} °C</Typography>
                </CardContent>
              </Card>
            </Grid>
            {/* Kelembaban */}
            <Grid item xs={1}>
              <Card
                onMouseEnter={handleCardHover2}
                onMouseLeave={handleCardHover2}
                sx={{ minHeight: "90px" }}
                style={{
                  backgroundColor: "#000000",
                  boxShadow: hoverCard2 ? "0px 0px 20px 0px #000000" : "none",
                }}
              >
                <CardHeader title="Pressure Central" style={{ backgroundColor: "#312945", textAlign: "center" }} />
                <CardContent
                  style={{
                    backgroundColor: "#3D3356",
                    minHeight: "140px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <Typography variant="h4">{centralPress}</Typography>
                </CardContent>
              </Card>
            </Grid>
            {/* Status Menyemprot */}
            <Grid item xs={1}>
              <Card
                onMouseEnter={handleCardHover3}
                onMouseLeave={handleCardHover3}
                style={{
                  backgroundColor: "#000000",
                  boxShadow: hoverCard3 ? "0px 0px 20px 0px #000000" : "none",
                }}
              >
                <CardHeader title="Humidity Central" style={{ backgroundColor: "#312945", textAlign: "center" }} />
                <CardContent
                  style={{
                    backgroundColor: "#3D3356",
                    minHeight: "140px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <Typography variant="h4">{centralHumid}</Typography>
                </CardContent>
              </Card>
            </Grid>
            {/* Ketinggian Barometer */}
            <Grid item xs={1}>
              <Card
                onMouseEnter={handleCardHover4}
                onMouseLeave={handleCardHover4}
                style={{
                  backgroundColor: "#000000",
                  boxShadow: hoverCard4 ? "0px 0px 20px 0px #000000" : "none",
                }}
              >
                <CardHeader title="Pressure Gas Central" style={{ backgroundColor: "#312945", textAlign: "center" }} />
                <CardContent
                  style={{
                    backgroundColor: "#3D3356",
                    minHeight: "140px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <Typography variant="h4">{centralGas}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={1}>
              <Card
                onMouseEnter={handleCardHover5}
                onMouseLeave={handleCardHover5}
                style={{
                  backgroundColor: "#000000",
                  boxShadow: hoverCard5 ? "0px 0px 20px 0px #000000" : "none",
                }}
              >
                <CardHeader title="Temp Node" style={{ backgroundColor: "#312945", textAlign: "center" }} />
                <CardContent
                  style={{
                    backgroundColor: "#3D3356",
                    minHeight: "140px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <Typography variant="h4">{nodeTemp} °C</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={1}>
              <Card
                onMouseEnter={handleCardHover6}
                onMouseLeave={handleCardHover6}
                style={{
                  backgroundColor: "#000000",
                  boxShadow: hoverCard6 ? "0px 0px 20px 0px #000000" : "none",
                }}
              >
                <CardHeader title="Humidity Node" style={{ backgroundColor: "#312945", textAlign: "center" }} />
                <CardContent
                  style={{
                    backgroundColor: "#3D3356",
                    minHeight: "140px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <Typography variant="h4">{nodeHumid}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={1}>
              <Card
                onMouseEnter={handleCardHover7}
                onMouseLeave={handleCardHover7}
                style={{
                  backgroundColor: "#000000",
                  boxShadow: hoverCard7 ? "0px 0px 20px 0px #000000" : "none",
                }}
              >
                <CardHeader title="Moisture Node" style={{ backgroundColor: "#312945", textAlign: "center" }} />
                <CardContent
                  style={{
                    backgroundColor: "#3D3356",
                    minHeight: "140px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <Typography variant="h4">{nodeMoist}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <MDBContainer>
            <Typography
              style={{
                margin: "20px auto",
                color: "#BA365D",
                width: "100%",
                textAlign: "center",
                fontSize: "30px",
                fontWeight: "bold",
              }}
              component="h3"
            >
              Line Chart Attitude
            </Typography>
            <article
              style={{
                width: "100%",
                overflowX: "auto",
                height: "70vh",
                backgroundColor: "white",
              }}
            >
              <Line data={{ labels, datasets }} options={{ maintainAspectRatio: false }} />
            </article>
          </MDBContainer>
        </Stack>
      </Box>
    </Stack>
  );
};

export default Home;
