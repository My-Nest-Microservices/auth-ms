import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RegisterUserDto } from './dto';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthService');
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

      return {
        user: newUser,
        token: null,
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }
}
