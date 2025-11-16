# Sistema de Inversión Open League - Documentación Actualizada

## 🎯 Flujo del Sistema de Inversión

### Concepto Principal

Los inversores **NO** envían dinero directamente a jugadores. En su lugar:

1. **Inversores depositan** especificando:
   - **Propósito**: ¿Para qué se usará el dinero? (fisioterapia, suplementos, equipamiento, etc.)
   - **Jugadores beneficiarios**: Lista de jugadores a los que beneficiará esta inversión

2. **Comisión automática del 3%**:
   - Al momento del depósito, el 3% va directamente a OpenLeague
   - El 97% restante queda en el pool disponible

3. **Open League decide cuándo distribuir**:
   - Emite cupones temporales (30 días de validez)
   - Los cupones se almacenan en Arka CDN
   - Los jugadores pueden canjearlos con socios autorizados

4. **Canje de cupones**:
   - Jugador presenta cupón al socio (fisioterapeuta, gimnasio, tienda de suplementos, etc.)
   - Open League autoriza el canje
   - El socio recibe el pago del pool

---

## 📋 Contrato OpenLeagueInversionPool

### Estructuras de Datos

#### Investment (Inversión)

```solidity
struct Investment {
  address investor;              // Quien invirtió
  uint256 amount;                // Cantidad total depositada
  uint256 amountAfterCommission; // Cantidad después del 3%
  string purpose;                // "fisioterapia", "suplementos", etc.
  address[] targetPlayers;       // Jugadores beneficiarios
  uint256 timestamp;             // Cuándo se hizo
  bool distributed;              // Si ya fue distribuida
}
```

#### Coupon (Cupón)

```solidity
struct Coupon {
  uint256 investmentId;          // ID de la inversión origen
  address player;                // Jugador beneficiario
  uint256 amount;                // Monto del cupón
  string purpose;                // Propósito (heredado de Investment)
  uint256 createdAt;             // Fecha de creación
  uint256 expiresAt;             // Fecha de expiración (30 días)
  bool redeemed;                 // Si fue canjeado
  string arkaCdnHash;            // Hash en Arka CDN
}
```

---

## 🔄 Funciones Principales

### 1. `investorDeposit` - Inversor deposita fondos

```solidity
function investorDeposit(
  string memory purpose,
  address[] memory targetPlayers
) external payable
```

**Ejemplo de uso:**

```javascript
const purpose = 'fisioterapia';
const targetPlayers = ['0xJugador1Address', '0xJugador2Address'];

await inversionPool
  .connect(investor)
  .investorDeposit(purpose, targetPlayers, { value: ethers.parseEther('10') });

// Resultado:
// - 0.3 ETH (3%) → OpenLeague automáticamente
// - 9.7 ETH → Pool disponible para los jugadores especificados
```

**Eventos emitidos:**

- `InvestmentReceived(investmentId, investor, amount, amountAfterCommission, purpose, targetPlayers)`

---

### 2. `issueCoupon` - Open League emite cupón

```solidity
function issueCoupon(
  uint256 investmentId,
  address player,
  uint256 amount,
  string memory arkaCdnHash
) external onlyOwner
```

**Ejemplo de uso:**

```javascript
// Open League decide emitir un cupón de 5 ETH para fisioterapia
const investmentId = 0;
const playerAddress = '0xJugadorAddress';
const amount = ethers.parseEther('5');
const arkaCdnHash = 'QmXxxx...'; // Hash del cupón en Arka CDN (30 días validez)

await inversionPool.issueCoupon(investmentId, playerAddress, amount, arkaCdnHash);

// El cupón ahora está activo y el jugador puede canjearlo
```

**Validaciones:**

- El jugador debe estar en `targetPlayers` de la inversión
- La inversión no debe estar marcada como distribuida
- El hash de Arka CDN debe ser único
- Debe haber suficiente balance en el pool

**Eventos emitidos:**

- `CouponIssued(couponId, investmentId, player, amount, purpose, arkaCdnHash, expiresAt)`

---

### 3. `redeemCoupon` - Canjear cupón

```solidity
function redeemCoupon(
  uint256 couponId,
  address payable partner
) external onlyOwner
```

**Ejemplo de uso:**

```javascript
// Jugador presenta cupón en la clínica de fisioterapia
// Open League verifica y autoriza el canje

const couponId = 0;
const partnerAddress = '0xClinicaFisioterapiaAddress';

await inversionPool.redeemCoupon(couponId, partnerAddress);

// La clínica recibe el pago del pool
```

**Validaciones:**

- El cupón no debe estar ya canjeado
- El cupón no debe estar expirado (30 días)
- Debe haber suficiente balance en el pool

**Eventos emitidos:**

- `CouponRedeemed(couponId, player, partner)`

---

### 4. `directDistribution` - Distribución directa (sin cupón)

```solidity
function directDistribution(
  uint256 investmentId,
  address payable recipient,
  uint256 amount
) external onlyOwner
```

**Ejemplo de uso:**

```javascript
// Open League decide hacer un pago directo sin cupón
const investmentId = 0;
const recipientAddress = '0xProveedorAddress';
const amount = ethers.parseEther('3');

await inversionPool.directDistribution(investmentId, recipientAddress, amount);
```

---

## 🔍 Funciones de Consulta

### Obtener inversión

```javascript
const investment = await inversionPool.getInvestment(investmentId);

console.log({
  investor: investment.investor,
  amount: ethers.formatEther(investment.amount),
  amountAfterCommission: ethers.formatEther(investment.amountAfterCommission),
  purpose: investment.purpose,
  targetPlayers: investment.targetPlayers,
  timestamp: new Date(investment.timestamp * 1000),
  distributed: investment.distributed,
});
```

### Obtener cupón

```javascript
const coupon = await inversionPool.getCoupon(couponId);

console.log({
  player: coupon.player,
  amount: ethers.formatEther(coupon.amount),
  purpose: coupon.purpose,
  createdAt: new Date(coupon.createdAt * 1000),
  expiresAt: new Date(coupon.expiresAt * 1000),
  redeemed: coupon.redeemed,
  arkaCdnHash: coupon.arkaCdnHash,
});
```

### Buscar cupón por hash de Arka CDN

```javascript
const arkaCdnHash = 'QmXxxx...';
const couponId = await inversionPool.getCouponByHash(arkaCdnHash);
const coupon = await inversionPool.getCoupon(couponId);
```

### Obtener cupones de un jugador

```javascript
const playerCouponIds = await inversionPool.getPlayerCoupons(playerAddress);

for (const couponId of playerCouponIds) {
  const coupon = await inversionPool.getCoupon(couponId);
  console.log('Cupón', couponId, ':', coupon);
}
```

### Obtener inversiones de un inversor

```javascript
const investorInvestmentIds = await inversionPool.getInvestorInvestments(investorAddress);

for (const investmentId of investorInvestmentIds) {
  const investment = await inversionPool.getInvestment(investmentId);
  console.log('Inversión', investmentId, ':', investment);
}
```

---

## 📊 Estadísticas del Pool

```javascript
const stats = {
  totalPoolBalance: await inversionPool.totalPoolBalance(),
  totalInvestorContributions: await inversionPool.totalInvestorContributions(),
  totalCommissionsPaid: await inversionPool.totalCommissionsPaid(),
  totalDistributed: await inversionPool.totalDistributed(),
  totalInvestments: await inversionPool.getTotalInvestments(),
  totalCoupons: await inversionPool.getTotalCoupons(),
};

console.log({
  poolBalance: ethers.formatEther(stats.totalPoolBalance) + ' ETH',
  contributions: ethers.formatEther(stats.totalInvestorContributions) + ' ETH',
  commissions: ethers.formatEther(stats.totalCommissionsPaid) + ' ETH',
  distributed: ethers.formatEther(stats.totalDistributed) + ' ETH',
  investments: stats.totalInvestments.toString(),
  coupons: stats.totalCoupons.toString(),
});
```

---

## 🎯 Casos de Uso Ejemplo

### Caso 1: Inversor quiere ayudar con fisioterapia

```javascript
// 1. Inversor deposita
const purpose = 'fisioterapia';
const targetPlayers = ['0xJugador1', '0xJugador2'];
await inversionPool.connect(investor).investorDeposit(purpose, targetPlayers, {
  value: ethers.parseEther('20'), // 20 ETH
});
// → 0.6 ETH va a OpenLeague
// → 19.4 ETH queda en el pool

// 2. Jugador1 necesita fisioterapia, Open League emite cupón
await inversionPool.issueCoupon(
  0, // investmentId
  '0xJugador1',
  ethers.parseEther('5'),
  'QmAbc123...', // Hash Arka CDN
);

// 3. Jugador1 va a la clínica y presenta el cupón
// 4. Open League verifica y canjea el cupón
await inversionPool.redeemCoupon(0, '0xClinicaAddress');
// → La clínica recibe 5 ETH
```

### Caso 2: Inversor quiere ayudar con suplementos

```javascript
// 1. Inversor deposita
const purpose = 'suplementos';
const targetPlayers = ['0xJugador3'];
await inversionPool.connect(investor).investorDeposit(purpose, targetPlayers, {
  value: ethers.parseEther('5'),
});

// 2. Open League emite cupón para tienda de suplementos
await inversionPool.issueCoupon(1, '0xJugador3', ethers.parseEther('4.85'), 'QmDef456...');

// 3. Jugador3 usa el cupón en la tienda
await inversionPool.redeemCoupon(1, '0xTiendaSuplementosAddress');
```

---

## ⚠️ Consideraciones Importantes

1. **Comisión del 3%**: Se cobra automáticamente al momento del depósito, NO al distribuir

2. **Cupones expiran en 30 días**: Los cupones no canjeados en 30 días expiran automáticamente

3. **Inversores NO pueden retirar**: Una vez depositado, solo Open League puede decidir cómo distribuir

4. **Arka CDN**: Los cupones se almacenan con un hash único en Arka CDN para verificación

5. **Jugadores beneficiarios**: Los cupones solo se pueden emitir para jugadores especificados en la inversión original

6. **Tracking completo**: Todas las inversiones, cupones y canjes quedan registrados en la blockchain

---

## 🔐 Seguridad

- ✅ ReentrancyGuard en todas las funciones de transferencia
- ✅ Ownable: Solo Open League puede emitir y canjear cupones
- ✅ Validación de expiración de cupones
- ✅ Verificación de jugadores beneficiarios
- ✅ Hashes únicos para cupones en Arka CDN
- ✅ Emergency withdrawal para casos críticos

---

## 📝 Deployment

```bash
npm run hardhat:compile
npm run hardhat:deploy-openleague -- --network localhost
```

Las direcciones de los contratos se guardan automáticamente en `.env`.

---

**Fecha de actualización:** Noviembre 2025  
**Versión:** 2.0 (Sistema de cupones con Arka CDN)
