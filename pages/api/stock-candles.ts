import { NextApiRequest, NextApiResponse } from 'next';
import { loadData, getStockCandlesData } from '../../app/lib/data-loader';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await loadData(); // 確保數據已加載
    const stockCandlesData = getStockCandlesData();
    res.status(200).json(stockCandlesData);
}
