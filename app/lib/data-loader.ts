import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

let stockInfoData: any[] = [];
let issuanceData: any[] = [];
let stockCandlesData: any[] = [];

const loadCSVData = (filePath: string) => {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return new Promise<any[]>((resolve, reject) => {
        Papa.parse(fileContent, {
            header: true,
            complete: (result) => {
                resolve(result.data);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};

export const loadData = async () => {
    if (!stockInfoData.length) {
        stockInfoData = await loadCSVData(path.join(process.cwd(), 'public', 'stock_info.csv'));
    }
    if (!issuanceData.length) {
        issuanceData = await loadCSVData(path.join(process.cwd(), 'public', 'Issuance_110_1-113_7.csv'));
    }
    if (!stockCandlesData.length) {
        stockCandlesData = await loadCSVData(path.join(process.cwd(), 'public', 'stock_candles.csv'));
    }
};

export const getStockInfoData = () => stockInfoData;
export const getIssuanceData = () => issuanceData;
export const getStockCandlesData = () => stockCandlesData;
