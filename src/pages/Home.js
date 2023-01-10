import React, { useEffect, useState } from "react";
import {
  Stack,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Box,
  Input,
} from "@mui/material";
import logo from "../logo_0.png";
import moment from "moment/moment";
import { Canvas } from "@react-three/fiber";
import { Physics, usePlane, useBox } from "@react-three/cannon";
import axios from "axios";
import GoogleMapReact from "google-map-react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { MDBContainer } from "mdbreact";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
  const [ref] = useBox(() => ({ mass: 1, ...props }));
  return (
    <mesh castShadow ref={ref}>
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

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        "https://back-end-vtol-ex.vercel.app/api/drone"
      );
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

  return (
    <Stack direction={"row"} gap={"20px"}>
      <Stack
        flexBasis={"25%"}
        width={"25%"}
        alignItems="center"
        gap="10px"
        sx={{ background: "#000000", height: "100vh", padding: "30px" }}
      >
        <img src={logo} alt="Logo" width="120px" />

        <Typography>{hoursTime}</Typography>
        <Typography>{daysTime}</Typography>

        <Canvas dpr={[1, 2]} shadows camera={{ position: [-5, 5, 5], fov: 20 }}>
          <ambientLight />
          <spotLight
            angle={0.25}
            penumbra={0.5}
            position={[10, 10, 5]}
            castShadow
          />
          <Physics allowSleep={true}>
            <Plane />
            <Cube
              position={[0, 5, 0]}
              rotation={[attitude.yaw, attitude.pitch, attitude.roll]}
            />
          </Physics>
        </Canvas>
      </Stack>
      <Box
        flexBasis={"75%"}
        width={"75%"}
        sx={{ overflowY: "scroll", maxHeight: "100vh" }}
      >
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
          <Input
            id="my-input"
            value={titik}
            sx={{ borderBottom: "1px solid #fffffff" }}
            onChange={(e) => setTitik(e.target.value)}
          />
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
              <LocationPin
                lat={defaultProps.center.lat}
                lng={defaultProps.center.lng}
                text="Drone"
                color="red"
              />
              {mapsFlight?.map((data, idx) => (
                <LocationPin
                  lat={data.lat}
                  lng={data.lng}
                  text={`Terbang ke-${idx + 1}`}
                  color="gray"
                />
              ))}
            </GoogleMapReact>
          </Stack>
          <Grid
            container
            spacing={2}
            columns={3}
            width="100%"
            justifyContent={"center"}
          >
            <Grid item xs={1}>
              <Card
                sx={{ minHeight: "90px" }}
                style={{ backgroundColor: "#000000" }}
              >
                <CardHeader
                  title="Suhu"
                  style={{ backgroundColor: "#312945", textAlign: "center" }}
                />
                <CardContent
                  style={{
                    backgroundColor: "#3D3356",
                    minHeight: "140px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <Typography variant="h4">25 °C</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Kelembaban */}
            <Grid item xs={1}>
              <Card
                sx={{ minHeight: "90px" }}
                style={{ backgroundColor: "#000000" }}
              >
                <CardHeader
                  title="Kelembaban"
                  style={{ backgroundColor: "#312945", textAlign: "center" }}
                />
                <CardContent
                  style={{
                    backgroundColor: "#3D3356",
                    minHeight: "140px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <Typography variant="h4">75%</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Status Menyemprot */}
            <Grid item xs={1}>
              <Card style={{ backgroundColor: "#000000" }}>
                <CardHeader
                  title="Kondisi Tanah"
                  style={{ backgroundColor: "#312945", textAlign: "center" }}
                />
                <CardContent
                  style={{
                    backgroundColor: "#3D3356",
                    minHeight: "140px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <Typography variant="h4">Basah</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Ketinggian Barometer */}
            <Grid item xs={1}>
              <Card style={{ backgroundColor: "#000000" }}>
                <CardHeader
                  title="Ketinggian"
                  style={{ backgroundColor: "#312945", textAlign: "center" }}
                />
                <CardContent
                  style={{
                    backgroundColor: "#3D3356",
                    minHeight: "140px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <Typography variant="h4">{attitude.att} meter</Typography>
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
              <Line
                data={{ labels, datasets }}
                options={{ maintainAspectRatio: false }}
              />
            </article>
          </MDBContainer>
        </Stack>
      </Box>
    </Stack>
  );
};

export default Home;
