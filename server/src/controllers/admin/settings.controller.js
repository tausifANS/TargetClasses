import { asyncHandler } from '../../utils/asyncHandler.js';
import * as settingsService from '../../services/settings.service.js';
import { env } from '../../config/env.js';

const SMTP_KEYS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];

export const getSmtpSettings = asyncHandler(async (_req, res) => {
  const values = await settingsService.getSettings(SMTP_KEYS);
  res.json({
    success: true,
    data: {
      host: values.SMTP_HOST || env.SMTP_HOST || '',
      port: values.SMTP_PORT || env.SMTP_PORT || '',
      user: values.SMTP_USER || env.SMTP_USER || '',
      from: values.SMTP_FROM || env.SMTP_FROM || '',
      // Never echo the password back — just say whether one is set.
      passwordSet: Boolean(values.SMTP_PASS || env.SMTP_PASS),
      // Whether the active value is a Sheets override or still the deploy-time env var.
      overridden: Object.values(values).some(Boolean),
    },
  });
});

export const updateSmtpSettings = asyncHandler(async (req, res) => {
  const { host, port, user, password, from } = req.body;

  if (host !== undefined) await settingsService.setSetting('SMTP_HOST', host);
  if (port !== undefined) await settingsService.setSetting('SMTP_PORT', String(port));
  if (user !== undefined) await settingsService.setSetting('SMTP_USER', user);
  if (from !== undefined) await settingsService.setSetting('SMTP_FROM', from);
  // Only touch the password if one was actually provided — leave the
  // existing credential alone when the admin is just updating e.g. the from name.
  if (password) await settingsService.setSetting('SMTP_PASS', password);

  res.json({ success: true, message: 'Email settings updated' });
});
