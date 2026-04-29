import { Router, Request, Response } from 'express';
import { parseConfig } from '../config-parser';
import { createAllModels } from '../schema-factory';
import { createDynamicRoutes } from '../route-factory';
import { authenticate, AuthRequest } from '../middleware/auth';

const dynamicRouter = Router();

// Store mounted configs
const mountedConfigs: { [key: string]: any } = {};

dynamicRouter.post('/mount', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { config_json } = req.body;
    console.log('Mount request for config_id:', req.body.config_id)
    const config = JSON.parse(config_json);
    console.log('Config apis:', config.apis)
    console.log('Config database:', config.database)
    
    const { normalised_config, warnings } = parseConfig(config);
    console.log('Normalized database tables:', normalised_config.database.tables)
    
    // Create models
    const models = createAllModels(normalised_config.database);
    console.log('Models created:', Object.keys(models))
    
    // Create routes
    const router = createDynamicRoutes(normalised_config);
    console.log('Routes created, stack:', router.stack?.map((r: any) => r.route?.path))
    
    // Store for later use
    const configId = req.body.config_id || 'default';
    mountedConfigs[configId] = { router, config: normalised_config };
    console.log('Config stored:', configId)
    
    res.json({
      mounted: true,
      warnings,
      routes: router.stack?.map((r: any) => ({
        path: r.route?.path,
        methods: r.route?.methods
      }))
    });
  } catch (error: any) {
    console.error('Mount error:', error)
    res.status(500).json({ error: error.message, mounted: false });
  }
});

// Mount specific config routes
dynamicRouter.use('/:configId', authenticate, (req: AuthRequest, res: Response, next) => {
  const configId = req.params.configId;
  const mounted = mountedConfigs[configId];
  
  if (!mounted) {
    return res.status(404).json({ error: 'Config not mounted' });
  }
  
  mounted.router(req, res, next);
});

export { dynamicRouter, mountedConfigs };
