/**
 * Ejemplo de configuración de Email Service
 * 
 * Este archivo muestra las diferentes formas de configurar el servicio de email
 */

// ===========================================
// OPCIÓN 1: SMTP CON GMAIL
// ===========================================

/*
# .env
EMAIL_PROVIDER=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=abcd-efgh-ijkl-mnop  # App Password de Google

Pasos para Gmail:
1. Habilita 2FA en tu cuenta de Google
2. Ve a https://myaccount.google.com/apppasswords
3. Genera una contraseña de aplicación
4. Usa esa contraseña en EMAIL_PASSWORD
*/

// ===========================================
// OPCIÓN 2: SMTP CON OUTLOOK
// ===========================================

/*
# .env
EMAIL_PROVIDER=smtp
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=tu-email@outlook.com
EMAIL_PASSWORD=tu-contraseña
*/

// ===========================================
// OPCIÓN 3: SMTP CON SENDGRID
// ===========================================

/*
# .env
EMAIL_PROVIDER=smtp
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.tu-api-key-de-sendgrid
*/

// ===========================================
// OPCIÓN 4: RESEND (RECOMENDADO)
// ===========================================

/*
# .env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_tu_api_key_aqui
RESEND_FROM_EMAIL=OpenLeague <noreply@tu-dominio.com>

Ventajas de Resend:
- 100 emails gratis al día (3,000/mes)
- API moderna y simple
- Mejor deliverability
- Dashboard con analytics
- Webhooks para tracking

Registro: https://resend.com
*/

// ===========================================
// OPCIÓN 5: MAILTRAP (SOLO PARA TESTING)
// ===========================================

/*
# .env para desarrollo/testing
EMAIL_PROVIDER=smtp
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=tu-username-de-mailtrap
EMAIL_PASSWORD=tu-password-de-mailtrap

Mailtrap captura todos los emails sin enviarlos realmente.
Ideal para desarrollo y testing.
Registro: https://mailtrap.io
*/

// ===========================================
// USO EN EL CÓDIGO
// ===========================================

import { Injectable } from '@nestjs/common';
import { EmailService } from '../src/email/email.service';

@Injectable()
export class ExampleService {
  constructor(private emailService: EmailService) { }

  async sendOtpExample() {
    // Enviar código OTP
    await this.emailService.sendOtpEmail(
      'user@example.com',
      '123456',
      'wallet_login'
    );
  }

  async sendWelcomeExample() {
    // Enviar email de bienvenida
    await this.emailService.sendWelcomeEmail(
      'user@example.com',
      'John Doe'
    );
  }
}

// ===========================================
// TESTING LOCAL
// ===========================================

/*
Para testing local sin configurar email real:

1. Usar Mailtrap (recomendado):
   - Crea cuenta gratis en https://mailtrap.io
   - Copia las credenciales SMTP
   - Configura EMAIL_PROVIDER=smtp con las credenciales de Mailtrap
   - Todos los emails se capturan en Mailtrap

2. Usar Resend en modo test:
   - Crea cuenta en https://resend.com
   - Usa la API key de testing
   - Solo envía emails a tu email verificado

3. Comentar temporalmente el envío de emails:
   - En desarrollo, puedes solo loggear el código OTP
   - Útil para pruebas rápidas sin configurar email
*/

// ===========================================
// PRODUCCIÓN
// ===========================================

/*
Recomendaciones para producción:

1. Resend (Mejor opción):
   - Dominio verificado
   - Plan pago para más volumen
   - Monitoreo con webhooks

2. SendGrid:
   - Plan gratuito: 100 emails/día
   - Buena deliverability
   - Dashboard completo

3. AWS SES:
   - Muy económico
   - Alta confiabilidad
   - Integración con AWS

4. Mailgun:
   - Plan gratuito: 5,000 emails/mes
   - API potente
   - Buen soporte
*/

export default {
  // Export vacío solo para que TypeScript compile
};
