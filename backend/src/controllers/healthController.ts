import { Request, Response } from 'express';
import { HealthCheckResponse } from '../types';

export const healthCheck = (_req: Request, res: Response): void => {
    const healthData: HealthCheckResponse = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
    };

    res.status(200).json({
        success: true,
        data: healthData,
    });
};
