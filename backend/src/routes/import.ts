import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { getModel } from '../schema-factory';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

interface ImportResult {
  success_count: number;
  error_rows: Array<{ row: number; error: string; data: any }>;
}

router.post('/csv', authenticate, upload.single('file'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const tableName = req.body.table_name;
    if (!tableName) {
      return res.status(400).json({ error: 'table_name is required' });
    }

    const Model = getModel(tableName);
    if (!Model) {
      return res.status(404).json({ error: `Table '${tableName}' not found` });
    }

    const results: any[] = [];
    const errors: Array<{ row: number; error: string; data: any }> = [];
    let rowIndex = 0;

    const stream = Readable.from(req.file.buffer.toString());
    
    stream
      .pipe(csv())
      .on('data', async (row: any) => {
        rowIndex++;
        try {
          // Add user_id to row data
          row.user_id = req.user!.id;
          await Model.create(row);
          results.push(row);
        } catch (error: any) {
          errors.push({ row: rowIndex, error: error.message, data: row });
        }
      })
      .on('end', () => {
        const result: ImportResult = {
          success_count: results.length,
          error_rows: errors
        };
        res.json(result);
      })
      .on('error', (error: any) => {
        next(error);
      });
  } catch (error) {
    next(error);
  }
});

export default router;
