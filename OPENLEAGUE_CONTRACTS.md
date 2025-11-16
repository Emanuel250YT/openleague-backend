# Open League Smart Contracts - Documentación Completa

## 📋 Contratos Creados

### 1. **OpenLeague.sol**

Contrato principal de Open League donde se aloja el dinero de la organización.

**Características:**

- ✅ Recibe automáticamente el 3% de comisión de las transacciones del InversionPool
- ✅ Solo el owner (Open League) puede retirar o transferir fondos
- ✅ Sistema de autorización para contratos que pueden enviar comisiones
- ✅ Función de batch transfer para múltiples pagos
- ✅ Protección contra reentrancy
- ✅ Retiro de emergencia

**Funciones principales:**

```solidity
function authorizeContract(address contractAddress) external onlyOwner
function deposit() external payable onlyOwner
function withdraw(address payable to, uint256 amount) external onlyOwner
function transferFunds(address payable to, uint256 amount) external onlyOwner
function batchTransfer(address payable[] calldata recipients, uint256[] calldata amounts) external onlyOwner
function getStats() external view returns (...)
```

---

### 2. **OpenLeagueInversionPool.sol**

Pool de inversión donde inversores añaden fondos y Open League paga a jugadores.

**Características:**

- ✅ Inversores pueden depositar fondos (pero NO pueden retirar)
- ✅ Solo el owner puede pagar a jugadores, retirar o transferir fondos
- ✅ Comisión automática del 3% en cada pago a jugadores (va al contrato OpenLeague)
- ✅ Tracking completo de inversiones y pagos
- ✅ Protección contra reentrancy
- ✅ Retiro de emergencia

**Funciones principales:**

```solidity
function investorDeposit() external payable
function openLeagueDeposit() external payable onlyOwner
function payPlayer(address payable player, uint256 amount) external onlyOwner
function withdraw(address payable to, uint256 amount) external onlyOwner
function transferFunds(address payable to, uint256 amount) external onlyOwner
function getInvestorBalance(address investor) external view returns (uint256)
function getTotalInvestors() external view returns (uint256)
```

**Flujo de comisión:**
Cuando se paga a un jugador:

1. Se calcula el 3% del monto
2. Se transfiere el monto completo al jugador
3. Se transfiere automáticamente el 3% al contrato OpenLeague
4. Ejemplo: Si pagas 100 ETH al jugador → Jugador recibe 100 ETH + OpenLeague recibe 3 ETH automáticamente

---

### 3. **OpenLeagueCup.sol**

Gestiona fondos para la Copa de Open League a nivel mundial.

**Características:**

- ✅ Sponsors pueden contribuir con nombre identificatorio
- ✅ Cualquier persona puede hacer contribuciones públicas
- ✅ Sistema de gestión de copas con fechas de inicio/fin
- ✅ Pago de premios a ganadores por posición
- ✅ Tracking completo de sponsors, contribuyentes y ganadores
- ✅ Batch payment para múltiples ganadores
- ✅ Protección contra reentrancy

**Funciones principales:**

```solidity
function createCup(string memory cupName, uint256 startDate, uint256 endDate) external onlyOwner
function sponsorContribute(string memory sponsorName) external payable
function publicContribute() external payable
function payPrize(address payable winner, uint256 position, uint256 amount) external onlyOwner
function batchPayPrizes(address payable[] calldata winners, uint256[] calldata positions, uint256[] calldata amounts) external onlyOwner
function getCupStats() external view returns (...)
function getSponsorInfo(address sponsorAddress) external view returns (...)
```

---

## 🚀 Instalación y Deployment

### 1. Instalar dependencias

```bash
npm install
```

### 2. Compilar contratos

```bash
npm run hardhat:compile
```

### 3. Desplegar en red local (Hardhat)

**Opción A: Terminal separado para el nodo local**

```bash
# Terminal 1: Levantar nodo local
npx hardhat node

# Terminal 2: Desplegar contratos
npm run hardhat:deploy-openleague -- --network localhost

# Terminal 2: Ejecutar tests
npm run hardhat:test-openleague -- --network localhost
```

**Opción B: Red de prueba (Sepolia, Mumbai, etc.)**

```bash
# Configurar .env con tu PRIVATE_KEY y RPC_URL
npm run hardhat:deploy-openleague -- --network sepolia
```

---

## 📝 Variables de Entorno

Después del deployment, se añaden automáticamente a tu `.env`:

```env
OPENLEAGUE_CONTRACT_ADDRESS=0x...
OPENLEAGUE_INVERSION_POOL_ADDRESS=0x...
OPENLEAGUE_CUP_ADDRESS=0x...
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Inversor deposita en el pool

```javascript
const inversionPool = await ethers.getContractAt('OpenLeagueInversionPool', INVERSION_POOL_ADDRESS);
await inversionPool.connect(investor).investorDeposit({ value: ethers.parseEther('10') });
```

### Ejemplo 2: Open League paga a un jugador (con comisión automática del 3%)

```javascript
const inversionPool = await ethers.getContractAt('OpenLeagueInversionPool', INVERSION_POOL_ADDRESS);
await inversionPool.payPlayer(playerAddress, ethers.parseEther('100'));
// El jugador recibe 100 ETH
// OpenLeague recibe 3 ETH automáticamente
```

### Ejemplo 3: Sponsor contribuye a la Copa

```javascript
const leagueCup = await ethers.getContractAt('OpenLeagueCup', LEAGUE_CUP_ADDRESS);
await leagueCup
  .connect(sponsor)
  .sponsorContribute('Nike Sports', { value: ethers.parseEther('50') });
```

### Ejemplo 4: Crear una Copa

```javascript
const leagueCup = await ethers.getContractAt('OpenLeagueCup', LEAGUE_CUP_ADDRESS);
const startDate = Math.floor(Date.now() / 1000);
const endDate = startDate + 30 * 24 * 60 * 60; // 30 días
await leagueCup.createCup('Open League World Cup 2025', startDate, endDate);
```

### Ejemplo 5: Pagar premios a ganadores

```javascript
const leagueCup = await ethers.getContractAt('OpenLeagueCup', LEAGUE_CUP_ADDRESS);

// Pago individual
await leagueCup.payPrize(winnerAddress, 1, ethers.parseEther('1000')); // Posición 1 = 1er lugar

// Pago batch (múltiples ganadores)
const winners = [address1, address2, address3];
const positions = [1, 2, 3];
const amounts = [ethers.parseEther('1000'), ethers.parseEther('500'), ethers.parseEther('250')];
await leagueCup.batchPayPrizes(winners, positions, amounts);
```

### Ejemplo 6: Retirar fondos de OpenLeague

```javascript
const openLeague = await ethers.getContractAt('OpenLeague', OPENLEAGUE_ADDRESS);
await openLeague.withdraw(destinationAddress, ethers.parseEther('50'));
```

---

## 🔒 Seguridad

Todos los contratos incluyen:

- ✅ OpenZeppelin's `Ownable` para control de acceso
- ✅ OpenZeppelin's `ReentrancyGuard` para protección contra reentrancy
- ✅ Funciones de retiro de emergencia
- ✅ Emisión de eventos para todas las acciones importantes
- ✅ Validación de inputs y checks con `require`

---

## 📊 Estadísticas y Consultas

### OpenLeague

```javascript
const stats = await openLeague.getStats();
// Returns: balance, commissions, withdrawals, transfers, authorizedContractsCount
```

### InversionPool

```javascript
const totalInvestors = await inversionPool.getTotalInvestors();
const poolBalance = await inversionPool.totalPoolBalance();
const investorBalance = await inversionPool.getInvestorBalance(investorAddress);
```

### LeagueCup

```javascript
const cupStats = await leagueCup.getCupStats();
// Returns: cupName, startDate, endDate, active, prizePool, sponsorsContributions, publicContributions, prizesPaid

const sponsorInfo = await leagueCup.getSponsorInfo(sponsorAddress);
const totalWinners = await leagueCup.getTotalWinners();
```

---

## 🧪 Testing

Para ejecutar los tests de interacción:

```bash
# Asegúrate de tener un nodo local corriendo
npx hardhat node

# En otra terminal
npm run hardhat:test-openleague -- --network localhost
```

---

## 📁 Estructura de Archivos

```
contracts/
├── OpenLeague.sol                    # Contrato principal
├── OpenLeagueInversionPool.sol       # Pool de inversión
└── OpenLeagueCup.sol                 # Copa mundial

scripts/
├── deploy-openleague.ts              # Script de deployment
└── test-openleague.ts                # Script de pruebas

deployments/
├── README.md                         # Documentación de deployment
└── openleague-deployment-*.json      # Información de deployment
```

---

## 🌐 Networks Soportadas

El proyecto está configurado para:

- ✅ Hardhat (local)
- ✅ Localhost (127.0.0.1:8545)
- ✅ Sepolia (testnet)
- ✅ Polkadot EVM (Moonbase Alpha, Moonbeam, Astar)

Para desplegar en otras redes, edita `hardhat.config.ts`.

---

## ⚠️ Notas Importantes

1. **Comisión automática:** Cuando pagas a un jugador desde InversionPool, el 3% se envía automáticamente a OpenLeague.

2. **Inversores no pueden retirar:** Los inversores solo pueden depositar fondos, no retirarlos. Solo el owner puede hacer retiros.

3. **Autorización preconfigurada:** El contrato InversionPool ya está autorizado para enviar comisiones a OpenLeague después del deployment.

4. **Owner único:** Todos los contratos tienen como owner la dirección que los desplegó. Si necesitas transferir la propiedad, usa `transferOwnership()`.

5. **Deployment único:** El script está diseñado para deployar los 3 contratos una sola vez y guardar las direcciones en `.env`.

---

## 📞 Contacto y Soporte

Para reportar issues o preguntas, contacta al equipo de desarrollo.

**Fecha de creación:** Noviembre 2025  
**Versión de Solidity:** 0.8.20  
**Framework:** Hardhat + Ethers.js v6
