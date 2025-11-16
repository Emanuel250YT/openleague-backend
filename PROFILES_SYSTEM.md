# 🎮 Sistema de Perfiles OpenLeague

## 📋 Resumen

Sistema completo de perfiles para la plataforma OpenLeague que permite a los usuarios crear diferentes tipos de perfiles (Jugador, Club, DT, Fan) con integración blockchain mediante NFTs y tokens ERC20 migrables.

## 🎯 Tipos de Perfiles

### 1. **Jugador (Player)**

Perfil para futbolistas profesionales con NFT único (ERC721).

**Características:**

- NFT único que representa la identidad del jugador
- Metadata on-chain (nombre, posición, número, nacionalidad)
- Estadísticas y logros
- Transferible entre wallets
- Actualizable por el propietario

### 2. **Club**

Perfil para clubes de fútbol con token ERC20 personalizado.

**Características:**

- Token ERC20 propio con símbolo personalizado (3-5 letras)
- Sistema de migración de tokens (cambiar símbolo/nombre)
- Supply controlado con máximo definido
- Información completa del club (estadio, ciudad, fundación)

### 3. **Entrenador (Coach/DT)**

Perfil para directores técnicos y entrenadores.

**Características:**

- Especialidad y licencias
- Años de experiencia
- Historial de logros
- Equipos dirigidos

### 4. **Fan**

Perfil para aficionados y seguidores.

**Características:**

- Sistema de puntos de lealtad
- Colección de NFTs
- Club y jugador favorito
- Recompensas por participación

## 🏗️ Arquitectura

### Base de Datos (Prisma)

```prisma
// Enum de tipos de perfil
enum ProfileType {
  PLAYER
  CLUB
  COACH
  FAN
}

// Un usuario puede tener múltiples perfiles
model User {
  // ... campos existentes
  playerProfile PlayerProfile?
  clubProfile   ClubProfile?
  coachProfile  CoachProfile?
  fanProfile    FanProfile?
}
```

### Smart Contracts

#### PlayerNFT.sol (ERC721)

Contrato para NFTs únicos de jugadores.

**Funciones principales:**

- `mintPlayer()` - Crear NFT de jugador
- `updatePlayerMetadata()` - Actualizar información del jugador
- `getPlayerInfo()` - Obtener información completa
- `deactivatePlayer()` / `reactivatePlayer()` - Gestionar estado

#### ClubToken.sol (ERC20)

Contrato para tokens de clubes con sistema de migración.

**Funciones principales:**

- `constructor()` - Crear token con nombre y símbolo
- `updateClubName()` - Actualizar nombre del club
- `mint()` / `burn()` - Gestionar supply
- `enableMigration()` - Habilitar migración a nuevo contrato
- `migrate()` - Migrar tokens al nuevo contrato

## 📡 API Endpoints

### General

```
GET /api/profiles/me
```

Obtiene todos los perfiles del usuario autenticado.

### Jugador

```
POST   /api/profiles/player          # Crear perfil de jugador
GET    /api/profiles/player/me       # Obtener mi perfil
PUT    /api/profiles/player          # Actualizar perfil
GET    /api/profiles/players         # Listar todos los jugadores
PUT    /api/profiles/player/nft      # Actualizar info del NFT
```

### Club

```
POST   /api/profiles/club            # Crear perfil de club
GET    /api/profiles/club/me         # Obtener mi perfil
GET    /api/profiles/clubs           # Listar todos los clubes
GET    /api/profiles/club/:clubName  # Buscar club por nombre
PUT    /api/profiles/club/token      # Actualizar info del token
```

### Entrenador

```
POST   /api/profiles/coach           # Crear perfil de DT
GET    /api/profiles/coach/me        # Obtener mi perfil
```

### Fan

```
POST   /api/profiles/fan             # Crear perfil de fan
GET    /api/profiles/fan/me          # Obtener mi perfil
PUT    /api/profiles/fan/loyalty     # Actualizar puntos de lealtad
```

### Eliminar Perfil

```
DELETE /api/profiles/:type            # Eliminar perfil (player, club, coach, fan)
```

## 🚀 Deployment de Contratos

### 1. Desplegar PlayerNFT

```bash
# Desplegar contrato de NFT de jugadores
npx hardhat run scripts/deploy-player-nft.ts --network <network>

# Guardar la dirección en .env
PLAYER_NFT_CONTRACT=0x...
```

### 2. Desplegar ClubToken

```bash
# Configurar variables (opcional)
export CLUB_NAME="Real Madrid CF"
export CLUB_SYMBOL="RMD"
export INITIAL_SUPPLY="1000000"

# Desplegar contrato de token del club
npx hardhat run scripts/deploy-club-token.ts --network <network>

# Guardar la dirección en .env
CLUB_TOKEN_CONTRACT=0x...
```

### 3. Scripts de Interacción

```bash
# Interactuar con PlayerNFT
npx hardhat run scripts/interact-player-nft.ts --network <network>

# Interactuar con ClubToken
npx hardhat run scripts/interact-club-token.ts --network <network>
```

## 💡 Ejemplos de Uso

### Crear Perfil de Jugador

```bash
curl -X POST http://localhost:3001/api/profiles/player \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Cristiano Ronaldo",
    "position": "Delantero",
    "jerseyNumber": 7,
    "height": 187,
    "weight": 83,
    "dateOfBirth": "1985-02-05",
    "nationality": "Portugal",
    "biography": "Considerado uno de los mejores jugadores de todos los tiempos",
    "statistics": {
      "goals": 850,
      "assists": 250,
      "matches": 1150
    }
  }'
```

### Crear Perfil de Club

```bash
curl -X POST http://localhost:3001/api/profiles/club \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "clubName": "Real Madrid CF",
    "shortName": "RMD",
    "tokenSymbol": "RMD",
    "tokenName": "Real Madrid Token",
    "foundedYear": 1902,
    "country": "España",
    "city": "Madrid",
    "stadium": "Santiago Bernabéu",
    "description": "El club más laureado de Europa",
    "socialLinks": {
      "twitter": "@realmadrid",
      "instagram": "@realmadrid",
      "website": "https://www.realmadrid.com"
    }
  }'
```

### Vincular NFT a Perfil de Jugador

```bash
curl -X PUT http://localhost:3001/api/profiles/player/nft \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "nftTokenId": "1",
    "contractAddress": "0x..."
  }'
```

### Vincular Token a Perfil de Club

```bash
curl -X PUT http://localhost:3001/api/profiles/club/token \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "tokenAddress": "0x...",
    "tokenSupply": "1000000000000000000000000"
  }'
```

## 🔄 Sistema de Migración de Tokens de Club

### Paso 1: Desplegar nuevo contrato

```bash
export CLUB_NAME="Real Madrid CF"
export CLUB_SYMBOL="RMA"  # Nuevo símbolo
export INITIAL_SUPPLY="1000000"

npx hardhat run scripts/deploy-club-token.ts --network <network>
# Nuevo contrato: 0xNEW_ADDRESS
```

### Paso 2: Habilitar migración en el contrato viejo

```javascript
// En el contrato viejo
await oldClubToken.enableMigration('0xNEW_ADDRESS');
```

### Paso 3: Los holders migran sus tokens

```javascript
// Cada holder ejecuta
await oldClubToken.migrate();
```

### Paso 4: Actualizar en la base de datos

```bash
curl -X PUT http://localhost:3001/api/profiles/club/token \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "tokenAddress": "0xNEW_ADDRESS",
    "tokenSupply": "1000000000000000000000000"
  }'
```

## 📊 Flujo Completo

### Flujo de Jugador

```
1. Usuario se registra → POST /api/auth/register
2. Usuario crea perfil de jugador → POST /api/profiles/player
3. Admin despliega PlayerNFT → npx hardhat run scripts/deploy-player-nft.ts
4. Admin mintea NFT para el jugador → playerNFT.mintPlayer()
5. Jugador vincula NFT a su perfil → PUT /api/profiles/player/nft
6. Jugador puede transferir su NFT → playerNFT.transferFrom()
```

### Flujo de Club

```
1. Usuario se registra → POST /api/auth/register
2. Usuario crea perfil de club → POST /api/profiles/club
3. Admin despliega ClubToken → npx hardhat run scripts/deploy-club-token.ts
4. Club vincula token a su perfil → PUT /api/profiles/club/token
5. Club distribuye tokens a fans → clubToken.transfer()
6. (Opcional) Club migra a nuevo token → clubToken.enableMigration()
```

## 🔐 Seguridad

- ✅ Todos los endpoints de perfiles requieren autenticación JWT
- ✅ Un usuario solo puede tener un perfil de cada tipo
- ✅ Los nombres de club y símbolos de token son únicos
- ✅ Solo el owner del NFT puede actualizar su metadata
- ✅ Solo el owner del contrato puede mintear NFTs
- ✅ Solo el owner del contrato puede habilitar migraciones

## 📈 Casos de Uso

### Para Jugadores

- Crear identidad digital única verificable
- Demostrar propiedad de carrera deportiva
- Monetizar imagen mediante NFT
- Transferir NFT en caso de cambio de representación

### Para Clubes

- Crear comunidad mediante tokens
- Generar ingresos por venta de tokens
- Implementar sistema de recompensas para fans
- Cambiar branding (nombre/símbolo) mediante migración

### Para Entrenadores

- Construir portafolio profesional
- Demostrar experiencia y logros
- Conectar con clubes

### Para Fans

- Acumular puntos de lealtad
- Coleccionar NFTs de jugadores
- Participar en gobernanza del club (futuro)
- Acceder a contenido exclusivo

## 🛠️ Tecnologías

- **Backend**: NestJS + TypeScript
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Blockchain**: Hardhat + Ethers.js
- **Smart Contracts**: Solidity 0.8.20 + OpenZeppelin
- **Autenticación**: JWT + Passport
- **Documentación**: Swagger/OpenAPI

## ✅ Estado de Implementación

- [x] Schema de Prisma con 4 tipos de perfiles
- [x] Smart Contract PlayerNFT (ERC721)
- [x] Smart Contract ClubToken (ERC20) con migración
- [x] Scripts de deployment
- [x] Servicios NestJS completos
- [x] Controladores con Swagger
- [x] Endpoints REST para CRUD de perfiles
- [x] Sistema de vinculación con contratos
- [x] Validaciones y seguridad
- [x] Migración de base de datos
- [x] Documentación completa

## 🚀 Próximos Pasos

- [ ] Implementar sistema de verificación de perfiles
- [ ] Agregar sistema de reputación
- [ ] Implementar marketplace de NFTs
- [ ] Sistema de gobernanza con tokens de club
- [ ] Integración con redes sociales
- [ ] Sistema de notificaciones
- [ ] Dashboard de analytics

---

**Servidor funcionando**: ✅ `http://localhost:3001/api`  
**Documentación Swagger**: ✅ `http://localhost:3001/api/docs`  
**Endpoints de Perfiles**: ✅ `/api/profiles/*`
