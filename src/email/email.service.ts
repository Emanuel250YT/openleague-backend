import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST') || 'smtp.gmail.com',
      port: this.configService.get('EMAIL_PORT') || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendOtpEmail(email: string, code: string, purpose: string): Promise<void> {
    const subject =
      purpose === 'wallet_login'
        ? 'Código OTP para inicio de sesión con wallet'
        : 'Código de verificación';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">OpenLeague - ${subject}</h2>
        <p>Tu código de verificación es:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px;">
          <h1 style="color: #4CAF50; letter-spacing: 5px; margin: 0;">${code}</h1>
        </div>
        <p style="color: #666; margin-top: 20px;">
          Este código expirará en 10 minutos.
        </p>
        <p style="color: #666;">
          Si no solicitaste este código, puedes ignorar este correo.
        </p>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"OpenLeague" <${this.configService.get('EMAIL_USER')}>`,
      to: email,
      subject,
      html,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">¡Bienvenido a OpenLeague, ${name}!</h2>
        <p>Tu cuenta ha sido creada exitosamente.</p>
        <p style="color: #666;">
          Ahora puedes participar en torneos y vincular tus wallets.
        </p>
      </div>
    `;

    await this.transporter.sendMail({
      from: `"OpenLeague" <${this.configService.get('EMAIL_USER')}>`,
      to: email,
      subject: 'Bienvenido a OpenLeague',
      html,
    });
  }
}
