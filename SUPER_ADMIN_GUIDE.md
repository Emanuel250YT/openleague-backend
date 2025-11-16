# Sistema de Super Admin - OpenLeague Backend

## Descripción

El sistema de super admin permite gestionar elementos críticos del sistema a través de un usuario especial configurado desde las variables de entorno.

## Configuración

### Variables de Entorno

Agrega las siguientes variables en tu archivo `.env`:

```env
# Super Admin Configuration
SUPER_ADMIN_EMAIL="admin@openleague.com"
SUPER_ADMIN_PASSWORD="SuperSecurePassword123!"
```

⚠️ **IMPORTANTE**: Cambia estos valores en producción por credenciales seguras.

### Inicialización Automática

El super admin se crea automáticamente cuando inicias la aplicación. El sistema:

1. Verifica si ya existe un super admin
2. Si no existe, crea uno con las credenciales del `.env`
3. Si existe pero no tiene el flag de super admin, lo actualiza
4. Crea automáticamente wallets de Polkadot y EVM para el super admin

## Roles del Sistema

El sistema incluye tres roles:

- **USER**: Usuario normal (por defecto)
- **ADMIN**: Administrador con permisos especiales
- **SUPER_ADMIN**: Super administrador con acceso total

## Protección de Rutas

### Uso del Guard de Super Admin

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';

@Controller('critical-resource')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class CriticalResourceController {
  // Solo el super admin puede acceder a estas rutas
}
```

### Uso del Guard de Roles

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin-resource')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminResourceController {
  
  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  findAll() {
    // Solo admins y super admins pueden acceder
  }
}
```

### Decoradores Disponibles

#### @SuperAdmin()
Marca una ruta como accesible solo para super administradores:

```typescript
import { SuperAdmin } from '../auth/decorators/super-admin.decorator';

@Get('critical-data')
@SuperAdmin()
async getCriticalData() {
  // Solo super admin
}
```

#### @Roles(...roles)
Marca una ruta como accesible para ciertos roles:

```typescript
import { Roles } from '../auth/decorators/roles.decorator';

@Get('admin-data')
@Roles('ADMIN', 'SUPER_ADMIN')
async getAdminData() {
  // Para admins y super admins
}
```

## Endpoints de Administración

### Autenticación

**Login del Super Admin:**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "admin@openleague.com",
  "password": "SuperSecurePassword123!"
}
```

**Respuesta:**
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "email": "admin@openleague.com",
    "name": "Super Admin",
    "role": "SUPER_ADMIN",
    "isSuperAdmin": true,
    "wallets": [...]
  }
}
```

### Gestión del Sistema

Todos estos endpoints requieren autenticación con el token del super admin:

#### Obtener Estadísticas del Sistema
```bash
GET /admin/stats
Authorization: Bearer {accessToken}
```

#### Listar Todos los Usuarios
```bash
GET /admin/users
Authorization: Bearer {accessToken}
```

#### Cambiar Rol de Usuario
```bash
PUT /admin/users/{userId}/role
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "role": "ADMIN"
}
```

#### Verificar Usuario Manualmente
```bash
POST /admin/users/{userId}/verify
Authorization: Bearer {accessToken}
```

#### Eliminar Usuario
```bash
DELETE /admin/users/{userId}
Authorization: Bearer {accessToken}
```

#### Listar Todos los Torneos
```bash
GET /admin/tournaments
Authorization: Bearer {accessToken}
```

#### Actualizar Estado de Torneo
```bash
PUT /admin/tournaments/{tournamentId}/status
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "ACTIVE"
}
```

## Ejemplo de Uso en Código

### Crear un Servicio Protegido

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CriticalService {
  constructor(private prisma: PrismaService) {}

  async deleteCriticalData(id: string) {
    // Solo el super admin podrá ejecutar este método
    return this.prisma.criticalResource.delete({
      where: { id }
    });
  }
}
```

### Crear un Controlador Protegido

```typescript
import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { CriticalService } from './critical.service';

@Controller('critical')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class CriticalController {
  constructor(private readonly criticalService: CriticalService) {}

  @Delete(':id')
  async deleteCritical(@Param('id') id: string) {
    return this.criticalService.deleteCriticalData(id);
  }
}
```

## Seguridad

### Mejores Prácticas

1. **Credenciales Fuertes**: Usa contraseñas complejas en producción
2. **Variables de Entorno**: No commitees el archivo `.env` al repositorio
3. **Logs de Auditoría**: Considera agregar logs para acciones del super admin
4. **Rotación de Tokens**: Implementa renovación periódica de tokens
5. **2FA**: Considera agregar autenticación de dos factores para el super admin

### Cambiar Credenciales del Super Admin

1. Actualiza las variables en `.env`
2. Reinicia la aplicación
3. El sistema actualizará automáticamente las credenciales

### Promocionar un Usuario a Super Admin

Usando código o base de datos directamente:

```typescript
await prisma.user.update({
  where: { email: 'usuario@ejemplo.com' },
  data: {
    role: 'SUPER_ADMIN',
    isSuperAdmin: true
  }
});
```

O usando el endpoint de cambio de rol (requiere ser super admin):

```bash
PUT /admin/users/{userId}/role
{
  "role": "SUPER_ADMIN"
}
```

## Estructura de la Base de Datos

El modelo User incluye:

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  password     String
  name         String?
  isVerified   Boolean  @default(false)
  role         UserRole @default(USER)
  isSuperAdmin Boolean  @default(false)
  // ... otros campos
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}
```

## Troubleshooting

### El super admin no se crea automáticamente

1. Verifica que las variables `SUPER_ADMIN_EMAIL` y `SUPER_ADMIN_PASSWORD` estén en `.env`
2. Revisa los logs de la aplicación al iniciar
3. Verifica la conexión a la base de datos

### Error "Solo los super administradores pueden acceder"

1. Verifica que estás usando el token del super admin
2. Confirma que el usuario tiene `isSuperAdmin: true` en la base de datos
3. Verifica que los guards estén correctamente aplicados

### No puedo cambiar roles

Solo el super admin puede cambiar roles. Asegúrate de estar autenticado como super admin.

## Migración

Si actualizas desde una versión anterior, ejecuta:

```bash
npx prisma migrate dev
```

Esto aplicará las migraciones necesarias para agregar los campos de roles y super admin.
