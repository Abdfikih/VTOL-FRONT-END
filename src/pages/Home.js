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
  port: 38789,
  host: "wss://driver.cloudmqtt.com",
  clientId: "mqttjs_" + Math.random().toString(16).substr(2, 8),
  username: "cbobzrgp",
  password: "CKvOQLxrtuqc",
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

  const totalNode = 3;

  const [centralTemp, setCentralTemp] = useState("");
  const [centralPress, setCentralPress] = useState("");
  const [centralHumid, setCentralHumid] = useState("");
  const [centralGas, setCentralGas] = useState("");
  const [nodeTemp1, setNodeTemp1] = useState("");
  const [nodeHumid1, setNodeHumid1] = useState("");
  const [nodeMoist1, setNodeMoist1] = useState("");
  const [nodeTemp2, setNodeTemp2] = useState("");
  const [nodeHumid2, setNodeHumid2] = useState("");
  const [nodeMoist2, setNodeMoist2] = useState("");
  const [nodeTemp3, setNodeTemp3] = useState("");
  const [nodeHumid3, setNodeHumid3] = useState("");
  const [nodeMoist3, setNodeMoist3] = useState("");

  useEffect(() => {
    const client = mqtt.connect("wss://driver.cloudmqtt.com:1884", options);

    client.on("connect", () => {
      console.log("MQTT client connected to the server.");
      // client.subscribe("totalNode");
      client.subscribe("/central/temp");
      client.subscribe("/central/press");
      client.subscribe("/central/humid");
      client.subscribe("/central/gas");
      // console.log("tes");
      // console.log(centralTemp);
      for (let i = 1; i <= totalNode; i++) {
        client.subscribe("/" + i + "/temp");
        client.subscribe("/" + i + "/humid");
        client.subscribe("/" + i + "/moist");
      }
    });

    console.log("masuk config");
    client.on("message", (topic, message) => {
      console.log("tessss");
      console.log(centralGas);
      if (topic === "/central/temp") {
        setCentralTemp(message.toString());
      } else if (topic === "/central/press") {
        setCentralPress(message.toString());
      } else if (topic === "/central/humid") {
        setCentralHumid(message.toString());
      } else if (topic === "/central/gas") {
        setCentralGas(message.toString());
      } else if (topic === "/1/temp") {
        console.log(message.toString());
        setNodeTemp1(message.toString());
      } else if (topic === "/1/humid") {
        setNodeHumid1(message.toString());
      } else if (topic === "/1/moist") {
        setNodeMoist1(message.toString());
      } else if (topic === "/2/temp") {
        console.log(message.toString());
        setNodeTemp2(message.toString());
      } else if (topic === "/2/humid") {
        setNodeHumid2(message.toString());
      } else if (topic === "/2/moist") {
        setNodeMoist2(message.toString());
      } else if (topic === "/3/temp") {
        console.log(message.toString());
        setNodeTemp3(message.toString());
      } else if (topic === "/3/humid") {
        setNodeHumid3(message.toString());
      } else if (topic === "/3/moist") {
        setNodeMoist3(message.toString());
      }
    });
    console.log(setCentralGas);
    return () => {
      client.end();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get("https://vtol-cigritous-backend.herokuapp.com/api/drone");
      setData(response.data);
      let lastElement = response.data.slice(-1)[0];
      setAttitude({
        // yaw: lastElement.yaw,
        // roll: lastElement.roll,
        // pitch: lastElement.pitch,
        // att: lastElement.alt,
        // lat: lastElement.lat,
        // lng: lastElement.lng,
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
  const [hoverCard8, setHoverCard8] = useState(false);
  const [hoverCard9, setHoverCard9] = useState(false);
  const [hoverCard10, setHoverCard10] = useState(false);
  const [hoverCard11, setHoverCard11] = useState(false);
  const [hoverCard12, setHoverCard12] = useState(false);
  const [hoverCard13, setHoverCard13] = useState(false);
  const [hoverCard14, setHoverCard14] = useState(false);
  const [hoverCard15, setHoverCard15] = useState(false);
  const [hoverCard16, setHoverCard16] = useState(false);
  const [hoverCard17, setHoverCard17] = useState(false);
  const [hoverCard18, setHoverCard18] = useState(false);
  const [hoverCard19, setHoverCard19] = useState(false);
  const [hoverCard20, setHoverCard20] = useState(false);
  const [hoverCard21, setHoverCard21] = useState(false);

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
  const handleCardHover8 = () => setHoverCard8(!hoverCard8);
  const handleCardHover9 = () => setHoverCard9(!hoverCard9);
  const handleCardHover10 = () => setHoverCard10(!hoverCard10);
  const handleCardHover11 = () => setHoverCard11(!hoverCard11);
  const handleCardHover12 = () => setHoverCard12(!hoverCard12);
  const handleCardHover13 = () => setHoverCard13(!hoverCard13);
  const handleCardHover14 = () => setHoverCard14(!hoverCard14);
  const handleCardHover15 = () => setHoverCard15(!hoverCard15);
  const handleCardHover16 = () => setHoverCard16(!hoverCard16);
  const handleCardHover17 = () => setHoverCard17(!hoverCard17);
  const handleCardHover18 = () => setHoverCard18(!hoverCard18);
  const handleCardHover19 = () => setHoverCard19(!hoverCard19);
  const handleCardHover20 = () => setHoverCard20(!hoverCard20);
  const handleCardHover21 = () => setHoverCard21(!hoverCard21);

  const [showCentral, setShowCentral] = useState(false);
  const [showNode1, setShowNode1] = useState(false);
  const [showNode2, setShowNode2] = useState(false);
  const [showNode3, setShowNode3] = useState(false);

  console.log("tes12333");

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
          <Stack direction={"column"} padding="10px" gap="10px"></Stack>

          <div>
            {titik >= 0 && (
              <>
                <button
                  onMouseEnter={handleCardHover14}
                  onMouseLeave={handleCardHover14}
                  style={{ backgroundColor: "#3D3356", color: "white", padding: "10px 30px", border: "none", boxShadow: hoverCard14 ? "0px 0px 20px 0px #000000" : "none" }}
                  onClick={() => setShowCentral(!showCentral)}
                >
                  Central
                </button>

                <Stack direction={"column"} padding="20px" gap="10px">
                  {showCentral && (
                    <>
                      <CorCard title="Cordinat Position Central" value={JSON.stringify(mapsFlight[0])} handleCardHover={handleCardHover18} hoverCard={hoverCard18} />
                      <Stack direction={"column"} padding="20px" gap="10px">
                        <Grid container spacing={2} columns={3} width="100%" justifyContent={"center"}>
                          <Grid item xs={1}>
                            <NodeCard title="Temp Central" value={centralTemp + " °C"} handleCardHover={handleCardHover1} hoverCard={hoverCard1} />
                          </Grid>
                          <Grid item xs={1}>
                            <NodeCard title="Humidity Central" value={centralHumid + " %"} handleCardHover={handleCardHover2} hoverCard={hoverCard2} />
                          </Grid>
                          <Grid item xs={1}>
                            <NodeCard title="Pressure Central" value={centralPress + " %"} handleCardHover={handleCardHover3} hoverCard={hoverCard3} />
                          </Grid>
                          <Grid item xs={1}>
                            <NodeCard title="Ozone Central" value={centralGas + " %"} handleCardHover={handleCardHover4} hoverCard={hoverCard4} />
                          </Grid>
                        </Grid>
                      </Stack>
                    </>
                  )}
                </Stack>
              </>
            )}

            {titik >= 1 && (
              <>
                <button
                  onMouseEnter={handleCardHover15}
                  onMouseLeave={handleCardHover15}
                  style={{ backgroundColor: "#3D3356", color: "white", padding: "10px 30px", border: "none", boxShadow: hoverCard15 ? "0px 0px 20px 0px #000000" : "none" }}
                  onClick={() => setShowNode1(!showNode1)}
                >
                  {" "}
                  Node 1
                </button>
                <Stack direction={"column"} padding="20px" gap="10px">
                  {showNode1 && (
                    <>
                      <CorCard title="Cordinat Position Node 1" value={JSON.stringify(mapsFlight[1])} handleCardHover={handleCardHover19} hoverCard={hoverCard19} />
                      <Stack direction={"column"} padding="20px" gap="10px">
                        <Grid container spacing={2} columns={3} width="100%" justifyContent={"center"}>
                          <Grid item xs={1}>
                            <NodeCard title="Temp Node 1" value={nodeTemp1 + " °C"} handleCardHover={handleCardHover5} hoverCard={hoverCard5} />
                          </Grid>
                          <Grid item xs={1}>
                            <NodeCard title="Humidity Node 1" value={nodeHumid1 + " %"} handleCardHover={handleCardHover6} hoverCard={hoverCard6} />
                          </Grid>
                          <Grid item xs={1}>
                            <NodeCard title="Moisture Node 1" value={nodeMoist1 + " %"} handleCardHover={handleCardHover7} hoverCard={hoverCard7} />
                          </Grid>
                        </Grid>
                      </Stack>
                    </>
                  )}
                </Stack>
              </>
            )}

            {titik >= 2 && (
              <>
                <button
                  onMouseEnter={handleCardHover16}
                  onMouseLeave={handleCardHover16}
                  style={{ backgroundColor: "#3D3356", color: "white", padding: "10px 30px", border: "none", boxShadow: hoverCard16 ? "0px 0px 20px 0px #000000" : "none" }}
                  onClick={() => setShowNode2(!showNode2)}
                >
                  {" "}
                  Node 2
                </button>
                <Stack direction={"column"} padding="20px" gap="10px">
                  {showNode2 && (
                    <>
                      <CorCard title="Cordinat Position Node 2" value={JSON.stringify(mapsFlight[2])} handleCardHover={handleCardHover20} hoverCard={hoverCard20} />
                      <Stack direction={"column"} padding="20px" gap="10px">
                        <Grid container spacing={2} columns={3} width="100%" justifyContent={"center"}>
                          <Grid item xs={1}>
                            <NodeCard title="Temp Node 2" value={nodeTemp2 + " °C"} handleCardHover={handleCardHover8} hoverCard={hoverCard8} />
                          </Grid>
                          <Grid item xs={1}>
                            <NodeCard title="Humidity Node 2" value={nodeHumid2 + " %"} handleCardHover={handleCardHover9} hoverCard={hoverCard9} />
                          </Grid>
                          <Grid item xs={1}>
                            <NodeCard title="Moisture Node 2" value={nodeMoist1 + " %"} handleCardHover={handleCardHover10} hoverCard={hoverCard10} />
                          </Grid>
                        </Grid>
                      </Stack>
                    </>
                  )}
                </Stack>
              </>
            )}

            {titik >= 3 && (
              <>
                <button
                  onMouseEnter={handleCardHover17}
                  onMouseLeave={handleCardHover17}
                  style={{ backgroundColor: "#3D3356", color: "white", padding: "10px 30px", border: "none", boxShadow: hoverCard17 ? "0px 0px 20px 0px #000000" : "none" }}
                  onClick={() => setShowNode3(!showNode3)}
                >
                  {" "}
                  Node 3
                </button>
                <Stack direction={"column"} padding="20px" gap="10px">
                  {showNode3 && (
                    <>
                      <CorCard title="Cordinat Position Node 3" value={JSON.stringify(mapsFlight[3])} handleCardHover={handleCardHover21} hoverCard={hoverCard21} />
                      <Stack direction={"column"} padding="20px" gap="10px">
                        <Grid container spacing={2} columns={3} width="100%" justifyContent={"center"}>
                          <Grid item xs={1}>
                            <NodeCard title="Temp Node 3" value={nodeTemp3 + " °C"} handleCardHover={handleCardHover11} hoverCard={hoverCard11} />
                          </Grid>
                          <Grid item xs={1}>
                            <NodeCard title="Humidity Node 3" value={nodeHumid3 + " %"} handleCardHover={handleCardHover12} hoverCard={hoverCard12} />
                          </Grid>
                          <Grid item xs={1}>
                            <NodeCard title="Moisture Node 3" value={nodeMoist3 + " %"} handleCardHover={handleCardHover13} hoverCard={hoverCard13} />
                          </Grid>
                        </Grid>
                      </Stack>
                    </>
                  )}
                </Stack>
              </>
            )}
          </div>

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
