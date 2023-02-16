import React from "react";
import { Line } from "react-chartjs-2";

function LineChartCentral({ data, title }) {
  // const { temp, humid, pressure, ozone } = data;
  const labels = [1, 2, 3, 4];
  const datasets = [
    {
      label: "Temperature",
      data: [25, 26, 27, 28, 29],
      backgroundColor: "rgba(255, 99, 132, 0.2)",
      borderColor: "rgba(255, 99, 132, 1)",
      borderWidth: 1,
    },
    {
      label: "Humidity",
      data: [40, 42, 39, 38, 37],
      backgroundColor: "rgba(54, 162, 235, 0.2)",
      borderColor: "rgba(54, 162, 235, 1)",
      borderWidth: 1,
    },
    {
      label: "Pressure",
      data: [60, 65, 63, 61, 59],
      backgroundColor: "rgba(255, 206, 86, 0.2)",
      borderColor: "rgba(255, 206, 86, 1)",
      borderWidth: 1,
    },
    {
      label: "Ozone",
      data: [100, 105, 102, 110, 115],
      backgroundColor: "rgba(75, 192, 192, 0.2)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
    },
  ];

  return (
    <>
      <h3 className="text-center text-4xl font-bold text-pink-600 my-10">{title}</h3>
      <article className="w-full overflow-x-auto h-96 bg-white">
        <Line data={{ labels, datasets }} options={{ maintainAspectRatio: false }} />
      </article>
    </>
  );
}
export default LineChartCentral;
