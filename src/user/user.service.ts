import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from '../redis/redis.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { md5 } from 'src/utils';

@Injectable()
export class UserService {
  private logger = new Logger();

  @InjectRepository(User)
  private readonly userResitory: Repository<User>;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  async register(user: RegisterUserDto) {
    console.log(user.email);

    const captcha = await this.redisService.get(`captcha_${user.email}`);
    console.log(captcha);

    if (!captcha) {
      throw new HttpException('验证码已过期', HttpStatus.BAD_REQUEST);
    }

    if (user.captcha !== captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userResitory.findOneBy({
      username: user.username,
    });

    if (foundUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }

    const newUser = new User();
    newUser.username = user.username;
    newUser.password = md5(user.password);
    newUser.email = user.email;
    newUser.nickName = user.nickName;

    try {
      await this.userResitory.save(newUser);
      return '注册成功';
    } catch (error) {
      this.logger.error(error, UserService);
      return '注册失败';
    }
  }
}
