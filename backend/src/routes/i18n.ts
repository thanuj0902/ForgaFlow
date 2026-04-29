import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Translation maps (in production, these would be in a database or separate files)
const translationMaps: { [key: string]: { [lang: string]: string } } = {
  'welcome': { en: 'Welcome', hi: 'स्वागत है', es: 'Bienvenido' },
  'submit': { en: 'Submit', hi: 'जमा करें', es: 'Enviar' },
  'cancel': { en: 'Cancel', hi: 'रद्द करें', es: 'Cancelar' },
  'loading': { en: 'Loading...', hi: 'लोड हो रहा है...', es: 'Cargando...' },
  'no_data': { en: 'No data available', hi: 'कोई डेटा उपलब्ध नहीं', es: 'No hay datos disponibles' },
  'created_at': { en: 'Created At', hi: 'बनाया गया', es: 'Creado' }
};

router.get('/translations/:lang', authenticate, (req: AuthRequest, res: Response) => {
  const lang = req.params.lang;
  
  const translations: { [key: string]: string } = {};
  
  for (const [key, translationsMap] of Object.entries(translationMaps)) {
    translations[key] = translationsMap[lang] || translationsMap['en'] || key;
  }
  
  res.json(translations);
});

router.get('/supported-languages', authenticate, (req: AuthRequest, res: Response) => {
  const languages = ['en', 'hi', 'es']; // Could be dynamic from config
  res.json(languages);
});

export default router;
