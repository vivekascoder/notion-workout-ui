"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChartOptions,
  ColorType,
  createChart,
  DeepPartial,
  LineStyle,
  Time,
} from "lightweight-charts";

export const generateRandomData = (
  startDate: string,
  days: number,
  minValue: number,
  maxValue: number
) => {
  const data = [];
  let currentDate = new Date(startDate);

  for (let i = 0; i < days; i++) {
    const value = (Math.random() * (maxValue - minValue) + minValue).toFixed(2);
    data.push({
      time: currentDate.toISOString().split("T")[0],
      value: parseFloat(value),
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
};

interface PoolChartProps {
  data: { time: Time; value: number }[];
}

const LWChart = (props: PoolChartProps) => {
  const chartContainerRef = useRef(null);
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  // A useEffect that creates the chart based on configuration on load
  useEffect(() => {
    const colors = {
      backgroundColor: "#171923",
      lineColorOne: "#553C9A",
      lineColorTwo: "#0099FF",
      textColor: "white",
      // areaTopColor: "#2962FF",
      // areaBottomColor: "rgba(41, 98, 255, 0.28)"
    };

    const chartOptions: DeepPartial<ChartOptions> = {
      layout: {
        background: { type: ColorType.Solid, color: colors.backgroundColor },
        textColor: colors.textColor,
      },
      width: (chartContainerRef.current as any)?.clientWidth,
      height: 250,
      autoSize: false,
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          visible: false,
        },
      },
    };

    if (chartContainerRef.current !== null) {
      // chart prep start
      setIsLoadingChart(true);

      const handleResize = () => {
        chart.applyOptions({
          width: (chartContainerRef.current as any)?.clientWidth,
        });
      };

      const chart = createChart(chartContainerRef.current, chartOptions);
      chart.timeScale().fitContent();

      // Series 1
      const newSeries1 = chart.addAreaSeries({
        lineColor: "#48BB78",
        topColor: "#48BB78B3",
        // bottomColor: "#27674980",

        priceLineColor: colors.lineColorOne,
        baseLineStyle: LineStyle.Solid,
        baseLineWidth: 3,
      });
      newSeries1.setData(props.data);

      // // Series 2
      // const newSeries2 = chart.addLineSeries({
      //   color: colors.lineColorTwo,
      //   priceLineColor: colors.lineColorTwo,
      //   baseLineStyle: LineStyle.Solid,
      //   baseLineWidth: 3,
      // });
      // const newSeries2data = generateRandomData("2018-12-01", 31, 10, 70);
      // newSeries2.setData(newSeries2data);

      window.addEventListener("resize", handleResize);

      setIsLoadingChart(false);

      return () => {
        window.removeEventListener("resize", handleResize);
        chart.remove();
      };
    }
  }, [props.data]);

  useEffect(() => console.log("isloading", isLoadingChart), [isLoadingChart]);

  return (
    <>
      {isLoadingChart ? (
        <p>preparing chart...</p>
      ) : (
        <div
          className="size-full border-dotted border-t border-[#2A2C30]"
          ref={chartContainerRef}
        />
      )}
    </>
  );
};

export default LWChart;
