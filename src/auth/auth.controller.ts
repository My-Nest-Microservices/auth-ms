import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @MessagePattern('auth.register.user')
  async registerUser(@Payload() user: RegisterUserDto) {
    return this.authService.registerUser(user);
  }
  @MessagePattern('auth.login.user')
  async loginUser(@Payload() user: LoginUserDto) {
    return this.authService.loginUser(user);
  }
  @MessagePattern('auth.verify.user')
  async verifyUser(@Payload() token: string) {
    const user = await this.authService.verifyToken(token);

    return user;
  }
}
