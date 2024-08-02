"use client";

import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Papa from 'papaparse';

interface StockInfo {
    stockCode: number;
    stockName: string;
    market: string;
    exchange: string;
    type: string;
    lastUpdated: string;
}
export function StockInfoMapping(data: string[]): StockInfo[] {
    // console.log('Stock info:');
    // console.log(data);

    return data.map((item: any) => ({
        stockCode: item['symbol'],
        stockName: item['name'],
        market: item['market'],
        exchange: item['exchange'],
        type: item['type'],
        lastUpdated: item['last_updated'],
    }));
}

interface StockData {
    date: string;
    stockCode: number;
    openingPrice: number;
    highestPrice: number;
    lowerPrice: number;
    closingPrice: number;
    tradingVolume: number;
}
export function StockDataMapping(data: string[]): StockData[] {
    // console.log('Stock data:');
    // console.log(data);

    return data.map((item: any) => ({
        date: item['date'],
        stockCode: item['symbol'],
        openingPrice: item['open'],
        highestPrice: item['high'],
        lowerPrice: item['low'],
        closingPrice: item['close'],
        tradingVolume: item['volume'],
    }));
}

interface IssuanceData {
    stockCode: number;
    timestamp: string;
}
export function IssuanceDataMapping(data: string[]): IssuanceData[] {
    // console.log('Stock data:');
    // console.log(data);

    return data.map((item: any) => ({
        stockCode: item['stock_id'],
        timestamp: item['timestamp'], // 提取日期部分
    }));
}

function CandlestickChart() {
    const [stockInfo, setStockInfo] = useState<StockInfo[]>([]);
    const [stockData, setStockData] = useState<StockData[]>([]);
    const [issuanceData, setIssuanceData] = useState<IssuanceData[]>([]);
    const [selectedStock, setSelectedStock] = useState<StockInfo | null>(null);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        fetch('stock_info.csv')
            .then(response => response.text())
            .then(textData => {
                const { data }: { data: string[] } = Papa.parse(textData, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                });

                const mappingData = StockInfoMapping(data);
                setStockInfo(mappingData);
            })
            .catch(error => console.error("Failed to load stock info data:", error));
    }, []);

    useEffect(() => {
        if (selectedStock)  {
            fetch('stock_candles.csv')
                .then(response => response.text())
                .then(textData => {
                    const { data }: { data: string[] } = Papa.parse(textData, {
                        header: true,
                        dynamicTyping: true,
                        skipEmptyLines: true,
                    });

                    const mappingData = StockDataMapping(data);
                    setStockData(mappingData);
                })
                .catch(error => console.error("Failed to load stock info data:", error));

            fetch('Issuance_110_1-113_7.csv')
                .then(response => response.text())
                .then(textData => {
                    const { data }: { data: string[] } = Papa.parse(textData, {
                        header: true,
                        dynamicTyping: true,
                        skipEmptyLines: true,
                    });

                    const mappingData = IssuanceDataMapping(data);
                    setIssuanceData(mappingData);
                })
                .catch(error => console.error("Failed to load stock info data:", error));
        }
    }, [selectedStock]);

    const handleStockChange = (event: any, value: StockInfo | null) => {
        setSelectedStock(value);
    };

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabValue(newValue);
    };

    const filteredStockData = selectedStock
        ? stockData.filter(item => item.stockCode === selectedStock.stockCode)
        : [];

    const filteredIssuanceData = selectedStock
        ? issuanceData.filter(item => item.stockCode === selectedStock.stockCode)
        : [];

    const markPoints = issuanceData.map(item => ({
        coord: [item.timestamp, filteredStockData.find(d => 
            selectedStock !== null && item.stockCode === selectedStock.stockCode && d.date === item.timestamp.split(' ')[0])?.highestPrice],
        value: '詢圈',
        itemStyle: { color: 'red' },
    }));

    const upColor = '#ec0000';
    const upBorderColor = '#8A0000';
    const downColor = '#00da3c';
    const downBorderColor = '#008F28';
    const option = {
        title: {
            text: selectedStock ? `${selectedStock.stockName} (${selectedStock.stockCode})` : 'Select a stock',
            left: 0,
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
            },
            formatter: (params: any) => {
                const date = new Date(params[0].axisValue).toISOString().split('T')[0]; // 提取日期部分
                const open = params[0].data[1];
                const close = params[0].data[2];
                const low = params[0].data[3];
                const high = params[0].data[4];
                const color = params[0].color;
                
                return `
                    <div>${date}</div>
                    <div><span style="color: ${color}; padding-right: 5px;">●</span>Candlestick</div>
                    <div>Open: ${open}</div>
                    <div>Close: ${close}</div>
                    <div>Low: ${low}</div>
                    <div>High: ${high}</div>
                `;
            },
        },
        legend: {
            data: ['candlesticks'],
        },
        grid: {
            left: '5%',
            right: '5%',
            bottom: '20%',
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
            type: 'time',
            data: filteredStockData.map(item => item.date),
            boundaryGap: false,
            axisLine: { onZero: false },
            splitLine: { show: false },
            min: 'dataMin',
            max: 'dataMax',
        },
        yAxis: {
            scale: true,
            splitArea: {
                show: true,
            },
        },
        series: [
            {
                name: 'candlesticks',
                type: 'candlestick',
                data: filteredStockData.map(item => [item.date, item.openingPrice, item.closingPrice, item.lowerPrice, item.highestPrice]),
                itemStyle: {
                    color: upColor,
                    color0: downColor,
                    borderColor: upBorderColor,
                    borderColor0: downBorderColor
                },
                markPoint: {
                    data: markPoints,
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

    return (
        <div>
            <div style={{ backgroundColor: '#f0f0f0', padding: '10px 15px', borderRadius: '5px', marginBottom: '20px' }}>
                <Autocomplete
                    options={stockInfo}
                    getOptionLabel={(option) => `${option.stockName} (${option.stockCode})`}
                    onChange={handleStockChange}
                    renderInput={(params) => <TextField {...params} label="Select Stock" />}
                />
            </div>
            <ReactECharts theme={'dark'} option={option} style={{ height: 400, margin: '20px 0' }} />
            <div style={{ backgroundColor: '#f0f0f0', padding: '10px 15px', borderRadius: '5px', marginTop: '20px' }}>
                <Box sx={{ width: '100%' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} centered>
                        <Tab label="Stock Data" />
                        <Tab label="Book Building" />
                    </Tabs>
                    {tabValue === 0 && (
                        <TableContainer component={Paper} style={{ marginTop: '20px', maxHeight: '600px', overflowY: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell align="right">Open</TableCell>
                                        <TableCell align="right">High</TableCell>
                                        <TableCell align="right">Low</TableCell>
                                        <TableCell align="right">Close</TableCell>
                                        <TableCell align="right">Volume</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                {filteredStockData.map((row) => (
                                    <TableRow key={row.date}>
                                        <TableCell component="th" scope="row">
                                            {row.date}
                                        </TableCell>
                                        <TableCell align="right">{row.openingPrice}</TableCell>
                                        <TableCell align="right">{row.highestPrice}</TableCell>
                                        <TableCell align="right">{row.lowerPrice}</TableCell>
                                        <TableCell align="right">{row.closingPrice}</TableCell>
                                        <TableCell align="right">{row.tradingVolume}</TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                    {tabValue === 1 && (
                        <TableContainer component={Paper} style={{ marginTop: '20px', maxHeight: '600px', overflowY: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Timestamp</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                {filteredIssuanceData.map((row) => (
                                    <TableRow key={row.timestamp}>
                                        <TableCell component="th" scope="row">
                                            {row.timestamp}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </div>
        </div>
    );
}

export default CandlestickChart;
