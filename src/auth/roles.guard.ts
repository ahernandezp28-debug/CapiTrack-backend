import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<number[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true; // No roles requeridos → acceso permitido

    const request = context.switchToHttp().getRequest();
    const user = request['dbUser'];

    if (!user) throw new ForbiddenException('Usuario no autenticado');

    // Verificamos si el rol del usuario está entre los requeridos
    if (!requiredRoles.includes(Number(user.rol_id))) {
      throw new ForbiddenException('No tiene permisos suficientes para acceder a este recurso');
    }

    return true;
  }
}

