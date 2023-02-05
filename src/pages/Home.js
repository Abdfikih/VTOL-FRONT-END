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
  const [mapsFlightLtd, setMapsFlightLtd] = useState([]);
  const [mapsFlightLng, setMapsFlightLng] = useState([]);
  const [data, setData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [start, setStart] = useState(0);

  let totalNode = 20;

  const nodes = [];

  for (let index = 1; index <= totalNode; index++) {
    nodes.push(index);
  }

  const [centralTemp, setCentralTemp] = useState("");
  const [centralPress, setCentralPress] = useState("");
  const [centralHumid, setCentralHumid] = useState("");
  const [centralGas, setCentralGas] = useState("");
  const [nodeTemp, setNodeTemp] = useState([]);
  const [nodeMoist, setNodeMoist] = useState([]);
  const [nodeHumid, setNodeHumid] = useState([]);

  const [showNode, setShowNode] = useState(Array(nodes.length).fill(false));
  const [hoverCard, setHoverCard] = useState(Array(nodes.length).fill(false));
  const [hoverDashboard, setHoverDashboard] = useState(false);
  const [hoverSettings, setHoverSettings] = useState(false);
  const [hoverControls, setHoverControls] = useState(false);

  const handleDashboardHover = () => setHoverDashboard(!hoverDashboard);
  const handleSettingsHover = () => setHoverSettings(!hoverSettings);
  const handleControlsHover = () => setHoverControls(!hoverControls);

  const [showCentral, setShowCentral] = useState(false);

  const handleCardHover = (index) => {
    const newHoverCard = [...hoverCard];
    newHoverCard[index] = !newHoverCard[index];
    setHoverCard(newHoverCard);
  };

  const handleNodeClick = (index) => {
    let newShowNode = [...showNode];
    newShowNode[index] = !newShowNode[index];
    setShowNode(newShowNode);
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
  };

  const handleResetLocation = () => {
    setMapsFlight([]);
    setMapsFlightLtd([]);
    setMapsFlightLng([]);
    setTitik(0);
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setHoursTime(moment().format("H:mm:ss"));
      setDaysTime(moment().format("ddd, DD MMMM YYYY"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(
    () => {
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
        for (let i = 1; i <= mapsFlight.length; i++) {
          client.publish("/" + i + "/latitude", JSON.stringify(mapsFlightLtd[i - 1]), { qos: 0 });
          client.publish("/" + i + "/longitude", JSON.stringify(mapsFlightLng[i - 1]), { qos: 0 });
        }
        for (let i = 1; i <= 20; i++) {
          client.subscribe("/" + i + "/temp");
          client.subscribe("/" + i + "/humid");
          client.subscribe("/" + i + "/moist");
          client.subscribe("/" + i + "/latitude");
          client.subscribe("/" + i + "/longitude");
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
        }
        for (let i = 1; i <= 20; i++) {
          if (topic === "/" + i + "/temp") {
            let arrTemp = [...nodeTemp];
            arrTemp.push(message.toString());
            setNodeTemp(arrTemp);
          } else if (topic === "/" + i + "humid") {
            let arrHumid = [...nodeHumid];
            arrHumid.push(message.toString());
            setNodeHumid(arrHumid);
          } else if (topic === "/" + i + "/moist") {
            let arrMoist = [...nodeMoist];
            arrMoist.push(message.toString());
            setNodeMoist(arrMoist);
          } else if (topic === "/" + i + "/latitude") {
            let arrLat = [...mapsFlightLtd];
            arrLat.push(message.toString());
            setMapsFlightLtd(arrLat);
          } else if (topic === "/" + i + "/longitude") {
            let arrLng = [...mapsFlightLng];
            arrLng.push(message.toString());
            setMapsFlightLng(arrLng);
            console.log(JSON.stringify(arrLng));
          }
        }
      });
      console.log(setCentralGas);
      return () => {
        client.end();
      };
    },
    [mapsFlight],
    [nodeTemp],
    [nodeHumid],
    [nodeMoist]
  );

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

  console.log("tes12333");

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
                  let arr1 = [...mapsFlightLtd];
                  let arr2 = [...mapsFlightLng];
                  arr.push({ lat: e.lat, lng: e.lng });
                  arr1.push(e.lat);
                  arr2.push(e.lng);
                  setMapsFlight(arr);
                  setMapsFlightLtd(arr1);
                  setMapsFlightLng(arr2);
                }
              }}
            >
              <LocationPin lat={defaultProps.center.lat} lng={defaultProps.center.lng} text="Drone" color="red" anchor={0.5} fixed={true} options={{ zIndex: 100 }} />
              {mapsFlight?.map((data, idx) => (
                <LocationPin lat={data.lat} lng={data.lng} text={`Terbang ke-${idx + 1}`} color="yellow" anchor={0.5} fixed={true} options={{ zIndex: 100 }} />
              ))}
            </GoogleMapReact>
          </Stack>
          <div>
            <button
              onMouseEnter={() => handleCardHover(1)}
              onMouseLeave={() => handleCardHover(1)}
              style={{ backgroundColor: "#3D3356", color: "white", padding: "10px 30px", border: "none", boxShadow: hoverCard[1] ? "0px 0px 20px 0px #000000" : "none" }}
              onClick={handleResetLocation}
            >
              Reset Location
            </button>
          </div>
          <Stack direction={"column"} padding="10px" gap="10px"></Stack>

          <div>
            {titik >= 0 && (
              <>
                <button
                  onMouseEnter={() => handleCardHover(2)}
                  onMouseLeave={() => handleCardHover(2)}
                  style={{ backgroundColor: "#3D3356", color: "white", padding: "10px 30px", border: "none", boxShadow: hoverCard[2] ? "0px 0px 20px 0px #000000" : "none" }}
                  onClick={() => setShowCentral(!showCentral)}
                >
                  Central
                </button>

                <Stack direction={"column"} padding="20px" gap="10px">
                  {showCentral && (
                    <>
                      <CorCard title="Coordinate Position Central" value={"Ltd : " + JSON.stringify(mapsFlightLtd[0]) + " | Lng : " + JSON.stringify(mapsFlightLng[0])} handleCardHover={() => handleCardHover(3)} hoverCard={hoverCard[3]} />
                      <Stack direction={"column"} padding="20px" gap="10px">
                        <Grid container spacing={2} columns={3} width="100%" justifyContent={"center"}>
                          <Grid item xs={1}>
                            <NodeCard title="Temp Central" value={centralTemp + " °C"} handleCardHover={() => handleCardHover(4)} hoverCard={hoverCard[4]} />
                          </Grid>
                          <Grid item xs={1}>
                            <NodeCard title="Humidity Central" value={centralHumid + " %"} handleCardHover={() => handleCardHover(5)} hoverCard={hoverCard[5]} />
                          </Grid>
                          <Grid item xs={1}>
                            <NodeCard title="Pressure Central" value={centralPress + " %"} handleCardHover={() => handleCardHover(6)} hoverCard={hoverCard[6]} />
                          </Grid>
                          <Grid item xs={1}>
                            <NodeCard title="Ozone Central" value={centralGas + " %"} handleCardHover={() => handleCardHover(7)} hoverCard={hoverCard[7]} />
                          </Grid>
                        </Grid>
                      </Stack>
                    </>
                  )}
                </Stack>
              </>
            )}

            {nodes.slice(1, titik).map((node, index) => (
              <>
                <button
                  key={index}
                  onMouseEnter={() => handleCardHover(index)}
                  onMouseLeave={() => handleCardHover(index)}
                  style={{
                    backgroundColor: "#3D3356",
                    color: "white",
                    padding: "10px 30px",
                    border: "none",
                    boxShadow: hoverCard[index] ? "0px 0px 20px 0px #000000" : "none",
                  }}
                  onClick={() => handleNodeClick(index)}
                >
                  Node {index + 1}
                </button>
                <Stack direction={"column"} padding="20px" gap="10px">
                  {showNode[index] && (
                    <>
                      <CorCard
                        title={`Coordinate Position Node ${index + 1}`}
                        value={`Ltd : ${JSON.stringify(mapsFlightLtd[index + 1])} | Lng : ${JSON.stringify(mapsFlightLng[index + 1])}`}
                        handleCardHover={() => handleCardHover(index * 3)}
                        hoverCard={hoverCard[index * 3]}
                      />
                      <Stack direction={"column"} padding="20px" gap="10px">
                        <Grid container spacing={2} columns={3} width="100%" justifyContent={"center"}>
                          <Grid item xs={1}>
                            <NodeCard title={`Temp Node ${index + 1}`} value={`${nodeTemp[index]} °C`} handleCardHover={() => handleCardHover(index * 3 + 1)} hoverCard={hoverCard[index * 3 + 1]} />
                          </Grid>
                          <Grid item xs={1}>
                            <NodeCard title={`Humidity Node ${index + 1}`} value={`${nodeHumid[index]} %`} handleCardHover={() => handleCardHover(index * 3 + 2)} hoverCard={hoverCard[index * 3 + 2]} />
                          </Grid>
                          <Grid item xs={1}>
                            <NodeCard title={`Moisture Node ${index + 1}`} value={`${nodeMoist[index]} %`} handleCardHover={() => handleCardHover(index * 3 + 3)} hoverCard={hoverCard[index * 3 + 3]} />
                          </Grid>
                        </Grid>
                      </Stack>
                    </>
                  )}
                </Stack>
              </>
            ))}

            {/* {titik > 2 && (
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
                      <CorCard title="Coordinate Position Node 2" value={"Ltd : " + JSON.stringify(mapsFlightLtd[2]) + " | Lng : " + JSON.stringify(mapsFlightLng[2])} handleCardHover={handleCardHover20} hoverCard={hoverCard20} />
                      <Stack direction={"column"} padding="20px" gap="10px">
                        <Grid container spacing={2} columns={3} width="100%" justifyContent={"center"}>
                          <Grid item xs={1}>
                            <NodeCard title="Temp Node 2" value={nodeTemp[1] + " °C"} handleCardHover={handleCardHover8} hoverCard={hoverCard8} />
                          </Grid>
                          <Grid item xs={1}>
                            <NodeCard title="Humidity Node 2" value={nodeHumid[1] + " %"} handleCardHover={handleCardHover9} hoverCard={hoverCard9} />
                          </Grid>
                          <Grid item xs={1}>
                            <NodeCard title="Moisture Node 2" value={nodeMoist[1] + " %"} handleCardHover={handleCardHover10} hoverCard={hoverCard10} />
                          </Grid>
                        </Grid>
                      </Stack>
                    </>
                  )}
                </Stack>
              </>
            )}

            {titik > 3 && (
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
                      <CorCard title="Coordinate Position Node 3" value={"Ltd : " + JSON.stringify(mapsFlightLtd[3]) + " | Lng : " + JSON.stringify(mapsFlightLng[3])} handleCardHover={handleCardHover21} hoverCard={hoverCard21} />
                      <Stack direction={"column"} padding="20px" gap="10px">
                        <Grid container spacing={2} columns={3} width="100%" justifyContent={"center"}>
                          <Grid item xs={1}>
                            <NodeCard title="Temp Node 3" value={nodeTemp[2] + " °C"} handleCardHover={handleCardHover11} hoverCard={hoverCard11} />
                          </Grid>
                          <Grid item xs={1}>
                            <NodeCard title="Humidity Node 3" value={nodeHumid[2] + " %"} handleCardHover={handleCardHover12} hoverCard={hoverCard12} />
                          </Grid>
                          <Grid item xs={1}>
                            <NodeCard title="Moisture Node 3" value={nodeMoist[2] + " %"} handleCardHover={handleCardHover13} hoverCard={hoverCard13} />
                          </Grid>
                        </Grid>
                      </Stack>
                    </>
                  )}
                </Stack>
              </>
            )} */}
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
