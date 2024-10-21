import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @MessagePattern('auth.register.user')
  async registerUser(@Payload() user: any) {
    console.log({ user });
    return user;
  }
  @MessagePattern('auth.login.user')
  async loginUser(@Payload() user: any) {
    return user;
  }
  @MessagePattern('auth.verify.user')
  async verifyUser(@Payload() user: any) {
    return user;
  }
}
