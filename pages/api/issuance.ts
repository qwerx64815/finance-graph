import { NextApiRequest, NextApiResponse } from 'next';
import { loadData, getIssuanceData } from '../../app/lib/data-loader';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await loadData(); // 確保數據已加載
    const issuanceData = getIssuanceData();
    res.status(200).json(issuanceData);
}
