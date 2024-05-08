"use client";

import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import Papa from 'papaparse';

interface StockData {
    date: string;
    stockCode: number;
    tradingVolume: number;
    transactionAmount: number;
    openingPrice: number;
    closingPrice: number;
    highestPrice: number;
    lowerPrice: number;
    priceChangePercentage: number;
    numberOfTransactions: number;
}
export function parseData(csvContent: string): StockData[] {
    const { data } = Papa.parse(csvContent, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
    });

    // console.log('Original data:');
    // console.log(data);

    return data.map((item: any) => ({
        date: item['Date'],
        stockCode: item['Stock Code'],
        tradingVolume: item['Trading Volume'],
        transactionAmount: item['Transaction Amount'],
        openingPrice: item['Opening Price'],
        closingPrice: item['Closing Price'],
        highestPrice: item['Highest Price'],
        lowerPrice: item['Lower Price'],
        priceChangePercentage: item['Price Change Percentage'],
        numberOfTransactions: item['Number of Transactions'],
    }));
}

function CandlestickChart() {
    const [stockData, setStockData] = useState<StockData[]>([]);
    useEffect(() => {
        fetch('TaiwanStock_2330_2017_to_2022.csv')
            .then(response => response.text())
            .then(data => {
                const parsedData = parseData(data);
                console.log('Parsed data:');
                console.log(parsedData);
                setStockData(parsedData);
            })
            .catch(error => console.error("Failed to load CSV data:", error));
    }, []);

    const dividendPayoutDates = ['2017-07-20', '2018-07-19', '2019-07-18', '2019-10-17', '2020-01-16', '2020-04-16', '2020-07-16', '2020-10-15', '2021-01-14', '2021-04-15', '2021-07-15', '2021-10-14', '2022-01-13', '2022-04-14', '2022-07-14', '2022-10-13'];
    const markPoints = dividendPayoutDates.map((date) => {
        return { name: date, coord: [date, stockData.find(item => item.date === date)?.highestPrice] };
    });

    const upColor = '#ec0000';
    const upBorderColor = '#8A0000';
    const downColor = '#00da3c';
    const downBorderColor = '#008F28';
    const option = {
        title: {
            text: 'TSMC 2330',
            left: 0,
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
            },
        },
        legend: {
            data: ['candlesticks'],
        },
        grid: {
            left: '10%',
            right: '10%',
            bottom: '15%',
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100,
            },
            {
                show: true,
                type: 'slider',
                top: '90%',
                start: 0,
                end: 100,
            }
        ],
        xAxis: {
            type: 'category',
            data: stockData.map(item => item.date),
            boundaryGap: false,
            axisLine: { onZero: false },
            splitLine: { show: false },
            min: 'dataMin',
            max: 'dataMax',
        },
        yAxis: {
            scale: true,
            splitArea: {
                show: true
            },
        },
        series: [
            {
                name: 'candlesticks',
                type: 'candlestick',
                data: stockData.map(item => [item.openingPrice, item.closingPrice, item.lowerPrice, item.highestPrice]),
                itemStyle: {
                    color: upColor,
                    color0: downColor,
                    borderColor: upBorderColor,
                    borderColor0: downBorderColor
                },
                markPoint: {
                    label: {
                        show: true,
                        fontSize: 10,
                        overflow: 'break',
                        formatter: (param: any) => {
                            return '股利\n發放日';
                        },
                    },
                    data: markPoints,
                    tooltip: {
                        formatter: (param: any) => {
                            return param.name + '<br>' + (param.data.coord || '');
                        }
                    }
                },
                markLine: {
                    symbol: ['none', 'none'],
                    data: [
                        [
                            {
                                name: 'from lowest to highest',
                                type: 'min',
                                valueDim: 'lowest',
                                symbol: 'circle',
                                symbolSize: 10,
                                label: {
                                    show: false,
                                },
                                emphasis: {
                                    label: {
                                        show: false,
                                    },
                                },
                            },
                            {
                                type: 'max',
                                valueDim: 'highest',
                                symbol: 'circle',
                                symbolSize: 10,
                                label: {
                                    show: false,
                                },
                                emphasis: {
                                    label: {
                                        show: false,
                                    },
                                },
                            },
                        ],
                        {
                            name: 'min line on close',
                            type: 'min',
                            valueDim: 'close',
                        },
                        {
                            name: 'max line on close',
                            type: 'max',
                            valueDim: 'close',
                        }
                    ]
                },
            },
        ],
    };

    return <ReactECharts theme={'dark'} option={option} style={{ height: 400 }} />;
};

export default CandlestickChart;
