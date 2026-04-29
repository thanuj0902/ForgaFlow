import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import ConfigStore from '../models/ConfigStore';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const configs = await ConfigStore.findAll({
      where: { user_id: req.user!.id }
    });
    res.json(configs.map(c => ({
      id: c.id,
      name: c.name,
      version: c.version,
      created_at: c.created_at,
      config_json: c.config_json,
      ...JSON.parse(c.config_json)
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, config_json } = req.body;
    const config = await ConfigStore.create({
      name,
      config_json,
      user_id: req.user!.id
    });
    res.status(201).json({ id: config.id, name: config.name });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const config = await ConfigStore.findOne({
      where: { id: req.params.id, user_id: req.user!.id }
    });
    if (!config) {
      return res.status(404).json({ error: 'Config not found' });
    }
    res.json({ id: config.id, name: config.name, config_json: config.config_json });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const config = await ConfigStore.findOne({
      where: { id: req.params.id, user_id: req.user!.id }
    });
    if (!config) {
      return res.status(404).json({ error: 'Config not found' });
    }
    await config.update(req.body);
    res.json({ id: config.id, name: config.name });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const config = await ConfigStore.findOne({
      where: { id: req.params.id, user_id: req.user!.id }
    });
    if (!config) {
      return res.status(404).json({ error: 'Config not found' });
    }
    await config.destroy();
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;