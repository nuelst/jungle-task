import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    console.log('JWT Auth Guard - Token present:', !!token);
    console.log('JWT Auth Guard - Secret:', this.configService.get('app.jwt.secret'));

    if (!token) {
      console.log('JWT Auth Guard - No token provided');
      throw new UnauthorizedException('Token not provided');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('app.jwt.secret')
      });
      console.log('JWT Auth Guard - Token verified successfully:', payload);
      request.user = payload;
      return true;
    } catch (error: any) {
      console.log('JWT Auth Guard - Token verification failed:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

