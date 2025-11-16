# Polkadot Wallet Integration

## 📝 Descripción

Este módulo implementa la creación automática de una **wallet de Polkadot** cuando un usuario se registra en la plataforma. Cada usuario recibe una wallet por defecto que puede usar para interactuar con la red Polkadot.

## 🚀 Características

- ✅ **Creación automática**: Cada nuevo usuario recibe una wallet de Polkadot al registrarse
- ✅ **Seguridad**: El mnemónico se muestra **solo una vez** durante el registro
- ✅ **Cifrado**: Los datos de la wallet se almacenan cifrados en la base de datos
- ✅ **Recuperación**: JSON cifrado disponible para importar la wallet en otras aplicaciones

## 📋 Flujo de Registro

1. **Usuario se registra** con email y contraseña
2. **Sistema crea automáticamente**:
   - Una wallet de Polkadot (red `polkadot`, currency `DOT`)
   - Genera un mnemónico de 12 palabras (BIP39)
   - Cifra el JSON de la wallet con la contraseña del usuario
   - Almacena los datos cifrados en la base de datos
3. **Respuesta incluye**:
   - Token de autenticación (JWT)
   - **Mnemónico de Polkadot** (⚠️ se muestra solo esta vez)
   - Información de la wallet (address)

## 🔐 Seguridad

### Datos Almacenados

- `address`: Dirección pública de la wallet (formato SS58)
- `encryptedJson`: JSON cifrado de la wallet (keystore)
- `encryptedMnemonic`: Hash del mnemónico (bcrypt)

### Importante

⚠️ **El mnemónico se muestra SOLO UNA VEZ durante el registro**

El usuario debe:

- Guardar el mnemónico en un lugar seguro
- NO compartirlo con nadie
- Usarlo para recuperar su wallet si es necesario

## 📡 Endpoints

### 1. Registro (Incluye creación de wallet)

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Respuesta:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "wallets": [
      {
        "id": "uuid",
        "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "network": "polkadot",
        "currency": "DOT",
        "provider": "polkadot",
        "isDefault": true
      }
    ]
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "polkadotMnemonic": "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
}
```

### 2. Obtener Wallets del Usuario

```http
GET /auth/wallets
Authorization: Bearer {accessToken}
```

### 3. Recuperación de Wallet (Información)

```http
POST /auth/polkadot/recovery
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "password": "SecurePassword123!"
}
```

**Respuesta:**

```json
{
  "mnemonic": "⚠️ Por seguridad, el mnemónico solo se muestra una vez durante la creación de la cuenta. Usa el JSON cifrado para importar la wallet.",
  "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
}
```

## 🔧 Implementación Técnica

### Servicio de Polkadot Wallet

```typescript
// src/auth/polkadot-wallet.service.ts
import { Keyring } from '@polkadot/api';
import { mnemonicGenerate, cryptoWaitReady } from '@polkadot/util-crypto';

@Injectable()
export class PolkadotWalletService {
  async createWallet(passphrase: string): Promise<PolkadotWalletData> {
    await cryptoWaitReady();
    const mnemonic = mnemonicGenerate();
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = keyring.addFromUri(mnemonic);

    return {
      mnemonic,
      address: pair.address,
      publicKey: Buffer.from(pair.publicKey).toString('hex'),
      encryptedJson: pair.toJson(passphrase),
    };
  }
}
```

### Modelo de Base de Datos

```prisma
model Wallet {
  id                 String   @id @default(uuid())
  address            String   @unique
  network            String   // "polkadot"
  currency           String   // "DOT"
  provider           String   // "polkadot"
  isDefault          Boolean  @default(false)
  encryptedJson      String?  // Keystore cifrado
  encryptedMnemonic  String?  // Hash del mnemónico
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  userId String
  user   User   @relation(fields: [userId], references: [id])
}
```

## 💡 Uso del Mnemónico

El usuario puede usar el mnemónico para:

1. **Importar en Polkadot.js Extension**:
   - Ir a https://polkadot.js.org/extension/
   - Instalar la extensión
   - Seleccionar "Import account from pre-existing seed"
   - Pegar el mnemónico de 12 palabras

2. **Importar en aplicaciones compatibles**:
   - Cualquier wallet compatible con Polkadot
   - Usar el formato sr25519

3. **Recuperar acceso**:
   - Si pierde acceso a la cuenta
   - Puede restaurar la wallet con el mnemónico

## 📦 Dependencias

```json
{
  "@polkadot/api": "^16.5.2",
  "@polkadot/keyring": "^13.5.8",
  "@polkadot/util-crypto": "^13.5.8"
}
```

## 🧪 Testing

Para probar la funcionalidad:

```bash
# Registrar un nuevo usuario
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'

# Guardar el mnemónico de la respuesta
# Verificar que la wallet se creó en la base de datos
```

## ⚠️ Notas Importantes

1. **El mnemónico es irrecuperable**: Una vez mostrado en el registro, no se puede volver a obtener
2. **Responsabilidad del usuario**: Debe guardar el mnemónico de forma segura
3. **JSON cifrado**: Se puede usar para importar la wallet sin el mnemónico
4. **Verificación de contraseña**: Requerida para cualquier operación sensible

## 🔄 Futuras Mejoras

- [ ] Opción para exportar el JSON cifrado
- [ ] Integración con Polkadot.js API para balance checking
- [ ] Firma de transacciones desde el backend
- [ ] Soporte para múltiples redes (Kusama, etc.)
- [ ] Backup automático del mnemónico cifrado en email

## 📚 Referencias

- [Polkadot.js Documentation](https://polkadot.js.org/docs/)
- [Substrate Account Generation](https://docs.substrate.io/reference/address-formats/)
- [BIP39 Mnemonic Standard](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
