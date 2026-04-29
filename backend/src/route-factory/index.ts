import { Router, Request, Response, NextFunction } from 'express';
import { getModel } from '../schema-factory';
import { authenticate, AuthRequest } from '../middleware/auth';

const ACTION_HANDLERS: { [key: string]: Function } = {};

export function registerAction(action: string, handler: Function) {
  ACTION_HANDLERS[action] = handler;
}

export function createDynamicRoutes(config: any): Router {
  const router = Router();
  const apis = config.apis || [];
  console.log('createDynamicRoutes called with apis:', apis)

  apis.forEach((apiConfig: any) => {
    createRoute(router, apiConfig);
  });

  return router;
}

function createRoute(router: Router, apiConfig: any) {
  const { path, method, action, table } = apiConfig;
  console.log('Creating route:', path, method, action, table)

  const Model = getModel(table);
  if (!Model) {
    console.error(`Model NOT FOUND for table: ${table}`)
    console.log('Available models:', Object.keys(require('../schema-factory').DYNAMIC_MODELS))
    return;
  }
  console.log('Found model for:', table)

  const handler = ACTION_HANDLERS[action];
  if (!handler) {
    console.warn(`No handler for action: ${action}`);
    return;
  }

  const wrappedHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, Model);
    } catch (error) {
      next(error);
    }
  };

  const fullPath = path.startsWith('/') ? path : `/${path}`;

  switch (method) {
    case 'GET':
      router.get(fullPath, authenticate, wrappedHandler);
      break;
    case 'POST':
      router.post(fullPath, authenticate, wrappedHandler);
      break;
    case 'PUT':
      router.put(`${fullPath}/:id`, authenticate, wrappedHandler);
      break;
    case 'DELETE':
      router.delete(`${fullPath}/:id`, authenticate, wrappedHandler);
      break;
  }
}

// Register default action handlers
registerAction('list', async (req: AuthRequest, res: Response, Model: any) => {
  const items = await Model.findAll({ where: { user_id: req.user!.id } });
  res.json(items);
});

registerAction('create', async (req: AuthRequest, res: Response, Model: any) => {
  const data = { ...req.body, user_id: req.user!.id };
  const item = await Model.create(data);
  res.status(201).json({ id: item.id });
});

registerAction('read', async (req: AuthRequest, res: Response, Model: any) => {
  const item = await Model.findOne({
    where: { id: req.params.id, user_id: req.user!.id }
  });
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json(item);
});

registerAction('update', async (req: AuthRequest, res: Response, Model: any) => {
  const item = await Model.findOne({
    where: { id: req.params.id, user_id: req.user!.id }
  });
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  await item.update(req.body);
  res.json({ id: item.id });
});

registerAction('delete', async (req: AuthRequest, res: Response, Model: any) => {
  const item = await Model.findOne({
    where: { id: req.params.id, user_id: req.user!.id }
  });
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  await item.destroy();
  res.status(204).send();
});
