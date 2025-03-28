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
  data: { time: Time; value: number; visual: string }[];
}

const LWChart = (props: PoolChartProps) => {
  const chartContainerRef = useRef(null);
  const chartTooltip = useRef<HTMLDivElement>(null);
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  // A useEffect that creates the chart based on configuration on load
  useEffect(() => {
    const colors = {
      backgroundColor: "#171717",
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
      //   const container = document.getElementsByClassName("lw-container")!;

      //   const toolTipWidth = 80;
      //   const toolTipHeight = 80;
      //   const toolTipMargin = 15;

      //   // Create and style the tooltip html element
      //   //   const toolTip = document.createElement("div");
      //   //   toolTip.style = `width: 96px; height: 80px; position: absolute; display: none; padding: 8px; box-sizing: border-box; font-size: 12px; text-align: left; z-index: 1000; top: 12px; left: 12px; pointer-events: none; border: 1px solid; border-radius: 2px;font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`;
      //   //   toolTip.style.background = "white";
      //   //   toolTip.style.color = "black";
      //   //   toolTip.style.borderColor = "#2962FF";
      //   //   container.appendChild(toolTip);

      //   chart.subscribeCrosshairMove((param) => {
      //     if (
      //       param.point === undefined ||
      //       !param.time ||
      //       param.point.x < 0 ||
      //       param.point.y < 0
      //     ) {
      //       chartTooltip.current!.style.display = "none";
      //     } else {
      //       const dateStr = param.time.toString();
      //       chartTooltip.current!.style.display = "block";
      //       const data: any = param.seriesData.get(newSeries1)!;
      //       const visual = data.visual !== undefined ? data.visual : data.visual;
      //       chartTooltip.current!.innerHTML = `<div>${JSON.stringify(
      //         data
      //       )}</div>`;

      //       // Position chartTooltip.current! according to mouse cursor position
      //       chartTooltip.current!.style.left = param.point.x + "px";
      //       chartTooltip.current!.style.top = param.point.y + "px";
      //     }
      //   });

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
          className="size-full border-dotted border-t border-[#2A2C30] lw-container relative"
          ref={chartContainerRef}
        >
          {/* <div
            style={{
              width: "96px",
              height: "80px",
              position: "absolute",
              display: "none",
              padding: "8px",
              boxSizing: "border-box",
              fontSize: "12px",
              textAlign: "left",
              zIndex: 1000,
              top: "12px",
              left: "12px",
              pointerEvents: "none",
              border: "1px solid",
              borderRadius: "2px",
              fontFamily: `-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif`,
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
            }}
            className="bg-black text-white "
            ref={chartTooltip}
          ></div> */}
        </div>
      )}
    </>
  );
};

export default LWChart;
