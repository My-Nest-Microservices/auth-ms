import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoginUserDto, RegisterUserDto } from './dto';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { envs } from 'src/config';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthService');

  constructor(private readonly jwtService: JwtService) {
    super();
  }
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to database');
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, name, password } = registerUserDto;
    try {
      const user = await this.user.findUnique({ where: { email } });

      if (user) {
        throw new RpcException({
          status: 400,
          message: 'User already exists',
        });
      }

      const newUser = await this.user.create({
        data: {
          email,
          name,
          password: bcrypt.hashSync(password, 10),
        },
        select: {
          email: true,
          name: true,
          id: true,
        },
      });

      const token = this.jwtService.sign({
        name: newUser.name,
        email: newUser.email,
        id: newUser.id,
      });

      return {
        user: newUser,
        token,
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }
  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    try {
      const user = await this.user.findUnique({ where: { email } });

      if (!user) {
        throw new RpcException({
          status: 400,
          message: 'Invalid credentials',
        });
      }

      const isValid = bcrypt.compareSync(password, user.password);

      if (!isValid) {
        throw new RpcException({
          status: 400,
          message: 'Invalid credentials',
        });
      }

      const { password: _, ...rest } = user;

      const token = this.jwtService.sign({
        name: user.name,
        email: user.email,
        id: user.id,
      });

      return {
        user: rest,
        token,
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async verifyToken(token: string) {
    if (!token) {
      throw new RpcException({
        status: 401,
        message: 'Unauthorized',
      });
    }

    try {
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret,
      });

      if (!user) {
        throw new RpcException({
          status: 401,
          message: 'Unauthorized',
        });
      }

      return {
        user,
        token: await this.jwtService.signAsync(user),
      };
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
