import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * 注册用户
   * @param registerUser
   * @returns
   */
  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser);
  }

  /**
   * 发送验证码
   * @param address 邮箱地址
   * @returns
   */
  @Get('captcha')
  async getCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(`captcha_${address}`, code, 3 * 60);
    await this.emailService.sendMail({
      to: address,
      subject: '注册验证码',
      html: `您的验证码是：${code}`,
    });
    return '发送成功';
  }

  /**
   * 初始化数据
   * @returns
   */
  @Get('init-data')
  async initData() {
    await this.userService.initData();
    return 'done';
  }
}
