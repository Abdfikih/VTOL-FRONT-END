import React, { useEffect, useState } from "react";
import { Stack, Typography, Grid, IconButton, Box, Input } from "@mui/material";
import logo from "../logo_0.png";
import moment from "moment/moment";
import { Canvas, useFrame, useThree } from "react-three-fiber";
import { Physics, usePlane } from "@react-three/cannon";
import axios from "axios";
import GoogleMapReact from "google-map-react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { MDBContainer } from "mdbreact";
import Button from "@mui/material/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import mqtt from "mqtt/dist/mqtt";
import CorCard from "./components/CoordinateCard";
import SensorCard from "./components/SensorCard";
import Cube from "./components/Cube";
import LineChartCentral from "./components/LineChartCentral";
import LineChartNode from "./components/LineChartNode";
import LocationPin from "./components/LocationPin";

var options = {
  port: 38789,
  host: "wss://driver.cloudmqtt.com",
  clientId: "mqttjs_" + Math.random().toString(16).substr(2, 8),
  username: "cbobzrgp",
  password: "CKvOQLxrtuqc",
};

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

  let arrTemp = [...nodeTemp];
  let arrHumid = [...nodeHumid];
  let arrMoist = [...nodeMoist];
  let arrLat = [...mapsFlightLtd];
  let arrLng = [...mapsFlightLng];

  const [showNode, setShowNode] = useState(Array(nodes.length).fill(false));
  const [hoverCard, setHoverCard] = useState(Array(nodes.length).fill(false));
  const [hoverDashboard, setHoverDashboard] = useState(false);
  const [hoverAbout, setHoverAbout] = useState(false);
  const [hoverControls, setHoverControls] = useState(false);

  const handleDashboardHover = () => setHoverDashboard(!hoverDashboard);
  const handleAboutHover = () => setHoverAbout(!hoverAbout);
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
  const [mapType, setMapType] = useState("roadmap");

  const handleViewChange = () => {
    setMapType(mapType === "roadmap" ? "satellite" : "roadmap");
  };

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
        client.subscribe("/central/temp");
        client.subscribe("/central/press");
        client.subscribe("/central/humid");
        client.subscribe("/central/gas");
        for (let i = 1; i <= mapsFlight.length; i++) {
          client.publish("/" + i + "/coordinate", JSON.stringify(mapsFlight[i - 1]), { qos: 0 });
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
        }
        if (topic === "/central/press") {
          setCentralPress(message.toString());
        }
        if (topic === "/central/humid") {
          setCentralHumid(message.toString());
        }
        if (topic === "/central/gas") {
          setCentralGas(message.toString());
        }
        for (let i = 1; i <= 20; i++) {
          if (topic === "/" + i + "/temp") {
            arrTemp[i - 1] = message.toString();
            setNodeTemp(arrTemp);
          }
          if (topic === "/" + i + "/moist") {
            arrMoist[i - 1] = message.toString();
            console.log(message.toString());
            setNodeMoist(arrMoist);
          }
          if (topic === "/" + i + "/humid") {
            arrHumid[i - 1] = message.toString();
            setNodeHumid(arrHumid);
          }
          if (topic === "/" + i + "/latitude") {
            arrLat[i - 1] = message.toString();
            setMapsFlightLtd(arrLat);
          }
          if (topic === "/" + i + "/longitude") {
            arrLng[i - 1] = message.toString();
            setMapsFlightLng(arrLng);
          }
        }
      });
      return () => {
        client.end();
      };
    },
    [mapsFlight],
    [nodeTemp],
    [nodeHumid],
    [nodeMoist]
  );

  const [shouldSkip, setShouldSkip] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShouldSkip(false);
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [shouldSkip]);

  useEffect(() => {
    const sendData = async () => {
      for (let i = 1; i <= titik; i++) {
        const data = {
          node: i,
          temperature: arrTemp[i - 1],
          humidity: arrHumid[i - 1],
          moisture: arrMoist[i - 1],
        };
        console.log("Data: ", data);
        try {
          if (!shouldSkip) {
            axios.post("http://localhost:3000/insertnode", data);
            console.log("Data sent to the backend");
            setShouldSkip(true);
          }
        } catch (error) {
          console.error("Error sending data to the backend: ", error);
        }
      }
    };
    sendData();
  }, [arrTemp, arrHumid, arrMoist, titik, shouldSkip]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get("https://vtol-cigritous-backend.herokuapp.com/api/drone");
      setData(response.data);
      let lastElement = response.data.slice(-1)[0];
      // setAttitude({
      //   yaw: lastElement.yaw,
      //   roll: lastElement.roll,
      //   pitch: lastElement.pitch,
      //   att: lastElement.alt,
      //   lat: lastElement.lat,
      //   lng: lastElement.lng,
      // });
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
  console.log(arrHumid[0]);
  console.log(arrHumid[1]);
  console.log(nodeTemp[0]);
  console.log(nodeTemp[1]);

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
          <Typography fontSize="14px">Jumlah Node</Typography>
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
              options={{ mapTypeId: mapType }}
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

                  // fetch("/api/save-location", {
                  //   method: "POST",
                  //   body: JSON.stringify({ lat: e.lat, lng: e.lng }),
                  //   headers: {
                  //     "Content-Type": "application/json",
                  //   },
                  // })
                  //   .then((response) => response.json())
                  //   .then((data) => console.log("Location saved:", data))
                  //   .catch((error) => console.error("Error:", error));
                }
              }}
            >
              <LocationPin lat={defaultProps.center.lat} lng={defaultProps.center.lng} text="Drone" color="red" />
              {mapsFlight?.map((data, idx) => (
                <LocationPin lat={data.lat} lng={data.lng} text={`Node ke-${idx + 1}`} color="yellow" />
              ))}
            </GoogleMapReact>
          </Stack>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              onMouseEnter={() => handleCardHover(24)}
              onMouseLeave={() => handleCardHover(24)}
              style={{ backgroundColor: "#3D3356", color: "white", padding: "10px 30px", border: "none", boxShadow: hoverCard[24] ? "0px 0px 20px 0px #000000" : "none" }}
              onClick={handleViewChange}
            >
              Switch to {mapType === "roadmap" ? "Satellite" : "Roadmap"} view
            </button>
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
                      <CorCard title="Coordinate Position Central" value={"Ltd :  || Lng : "} handleCardHover={() => handleCardHover(3)} hoverCard={hoverCard[3]} />
                      <Stack direction={"column"} padding="20px" gap="10px">
                        <Grid container spacing={2} columns={3} width="100%" justifyContent={"center"}>
                          <Grid item xs={1}>
                            <SensorCard title="Temp Central" value={centralTemp + " °C"} handleCardHover={() => handleCardHover(4)} hoverCard={hoverCard[4]} />
                          </Grid>
                          <Grid item xs={1}>
                            <SensorCard title="Humidity Central" value={centralHumid + " %"} handleCardHover={() => handleCardHover(5)} hoverCard={hoverCard[5]} />
                          </Grid>
                          <Grid item xs={1}>
                            <SensorCard title="Pressure Central" value={centralPress + " %"} handleCardHover={() => handleCardHover(6)} hoverCard={hoverCard[6]} />
                          </Grid>
                          <Grid item xs={1}>
                            <SensorCard title="Ozone Central" value={centralGas + " %"} handleCardHover={() => handleCardHover(7)} hoverCard={hoverCard[7]} />
                          </Grid>
                        </Grid>
                      </Stack>
                    </>
                  )}
                </Stack>
              </>
            )}

            {nodes.slice(0, titik).map((node, index) => (
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
                        value={`Ltd : ${JSON.stringify(mapsFlightLtd[index])} | Lng : ${JSON.stringify(mapsFlightLng[index])}`}
                        handleCardHover={() => handleCardHover(index * 3)}
                        hoverCard={hoverCard[index * 3]}
                      />
                      <Stack direction={"column"} padding="20px" gap="10px">
                        <Grid container spacing={2} columns={3} width="100%" justifyContent={"center"}>
                          <Grid item xs={1}>
                            <SensorCard title={`Temp Node ${index + 1}`} value={`${nodeTemp[index]} °C`} handleCardHover={() => handleCardHover(index * 3 + 1)} hoverCard={hoverCard[index * 3 + 1]} />
                          </Grid>
                          <Grid item xs={1}>
                            <SensorCard title={`Humidity Node ${index + 1}`} value={`${nodeHumid[index]} %`} handleCardHover={() => handleCardHover(index * 3 + 2)} hoverCard={hoverCard[index * 3 + 2]} />
                          </Grid>
                          <Grid item xs={1}>
                            <SensorCard title={`Moisture Node ${index + 1}`} value={`${nodeMoist[index]} %`} handleCardHover={() => handleCardHover(index * 3 + 3)} hoverCard={hoverCard[index * 3 + 3]} />
                          </Grid>
                        </Grid>
                      </Stack>
                    </>
                  )}
                </Stack>
              </>
            ))}
          </div>

          <MDBContainer>
            <LineChartCentral data={data} title={"Line Chart Central"} />
            {nodes.slice(0, titik).map((node, index) => (
              <>
                <LineChartNode temp={nodeTemp[index]} humid={nodeHumid[index]} moist={nodeHumid[index]} title={`Line Chart Node ${index + 1}`} />
              </>
            ))}
          </MDBContainer>
        </Stack>
      </Box>
    </Stack>
  );
};

export default Home;
