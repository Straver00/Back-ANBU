import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigType } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';
import { OTP } from './entities/otp.entity';
import { OTPType } from './enum/OTPType';
import { User } from '../users/entities/user.entity';
import { GenerateOTPDto } from './dto/generate-otp.dto';
import { VerifyOTPDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { emailConfig } from '../config/email';

@Injectable()
export class OTPService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(OTP)
    private readonly otpRepository: Repository<OTP>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(emailConfig.KEY)
    private readonly emailConfiguration: ConfigType<typeof emailConfig>,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.emailConfiguration.EMAIL_USER,
        pass: this.emailConfiguration.EMAIL_PASS,
      },
    });
  }

  async generateOTP(
    generateOTPDto: GenerateOTPDto,
  ): Promise<{ message: string }> {
    const { email, type } = generateOTPDto;

    let userId: string | undefined;

    // Verificar si el usuario existe y obtener su ID
    const user = await this.userRepository.findOne({ where: { email } });

    if (type === OTPType.LOGIN) {
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      userId = user.id;
    } else if (type === OTPType.PASSWORD_RESET) {
      // Para reset password, el usuario debe existir
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      userId = user.id;
    }

    // Invalidar códigos OTP anteriores no usados del mismo tipo
    await this.otpRepository.update(
      { email, type, isUsed: false },
      { isUsed: true, usedAt: new Date() },
    );

    // Generar nuevo código OTP
    const otpCode = this.generateRandomOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    const otp = this.otpRepository.create({
      email,
      otpCode,
      type,
      expiresAt,
      isUsed: false,
      attempts: 0,
      userId,
    });

    await this.otpRepository.save(otp);

    // Enviar email
    await this.sendOTPEmail(email, otpCode, type);

    return { message: 'Código OTP enviado exitosamente' };
  }

  async verifyOTP(
    verifyOTPDto: VerifyOTPDto,
  ): Promise<{ message: string; isValid: boolean }> {
    const { email, otpCode, type } = verifyOTPDto;

    const otp = await this.otpRepository.findOne({
      where: { email, type, isUsed: false },
      order: { createdAt: 'DESC' },
    });

    if (!otp) {
      throw new NotFoundException('Código OTP no encontrado o ya utilizado');
    }

    // Verificar si el código ha expirado
    if (new Date() > otp.expiresAt) {
      throw new BadRequestException('El código OTP ha expirado');
    }

    // Verificar intentos máximos
    if (otp.attempts >= 3) {
      throw new BadRequestException('Se han superado los intentos máximos');
    }

    // Incrementar intentos
    otp.attempts += 1;
    await this.otpRepository.save(otp);

    // Verificar código
    if (otp.otpCode !== otpCode) {
      throw new UnauthorizedException('Código OTP inválido');
    }

    // Marcar como usado
    otp.isUsed = true;
    otp.usedAt = new Date();
    await this.otpRepository.save(otp);

    return { message: 'Código OTP verificado exitosamente', isValid: true };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { email, otpCode, newPassword } = resetPasswordDto;

    // Verificar OTP
    await this.verifyOTP({
      email,
      otpCode,
      type: OTPType.PASSWORD_RESET,
    });

    // Buscar usuario
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async cleanExpiredOTPs(): Promise<void> {
    const now = new Date();
    await this.otpRepository.delete({
      expiresAt: LessThan(now),
    });
  }

  private generateRandomOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendOTPEmail(
    email: string,
    otpCode: string,
    type: OTPType,
  ): Promise<void> {
    const subject =
      type === OTPType.LOGIN
        ? 'Código de Verificación - Login'
        : 'Código de Verificación - Reset Password';
    const message =
      type === OTPType.LOGIN
        ? `Tu código de verificación para iniciar sesión es: ${otpCode}`
        : `Tu código de verificación para restablecer tu contraseña es: ${otpCode}`;

    const mailOptions = {
      from: this.emailConfiguration.EMAIL_USER,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Sistema ANBU</h2>
          <p>Hola,</p>
          <p>${message}</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; letter-spacing: 3px; margin: 0;">${otpCode}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">
            Este código expirará en 10 minutos.<br>
            Si no solicitaste este código, puedes ignorar este email.
          </p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            Este es un email automático, por favor no responder.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error enviando email:', error);
      throw new BadRequestException('Error enviando el código por email');
    }
  }
}
