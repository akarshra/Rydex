# Rydex Project - Critical Issues Action Plan

## 🚨 Top 10 Priority Fixes (Do Before Any Production Deployment)

### Priority 1: Fix Authorization Bypass (CRITICAL)
**Status:** 🔴 MUST FIX IMMEDIATELY  
**Time:** 1-2 hours  
**Files:**
- `backend/src/main/java/com/rydex/backend/config/SecurityConfig.java`

**Current Code (BROKEN):**
```java
.anyRequest().permitAll()  // ❌ Allows everything
```

**Fixed Code:**
```java
.anyRequest().authenticated()  // ✅ Deny unauthenticated access
```

**Test:** Try accessing `/api/booking` without token → should return 401

---

### Priority 2: Implement Real Payment Verification (CRITICAL)
**Status:** 🔴 MUST FIX IMMEDIATELY  
**Time:** 2-3 hours  
**Files:**
- `backend/src/main/java/com/rydex/backend/controller/PaymentController.java`

**Current Code (BROKEN):**
```java
@PostMapping("/verify")
public Map<String, Object> verify(@RequestBody Map<String, Object> payload) {
  result.put("success", true);  // ❌ ALWAYS returns success
  return result;
}
```

**Required Implementation:**
```java
@PostMapping("/verify")
public Map<String, Object> verify(@RequestBody PaymentVerificationRequest request) {
  try {
    // Call Stripe API to verify actual payment
    com.stripe.model.Charge charge = Charge.retrieve(request.chargeId());
    
    if (!charge.getPaid()) {
      return Map.of("success", false, "message", "Payment not confirmed");
    }
    
    // Update booking payment status in database
    Booking booking = bookingRepository.findById(request.bookingId())
      .orElseThrow();
    booking.setPaymentStatus("paid");
    bookingRepository.save(booking);
    
    return Map.of("success", true, "payment", charge.getId());
  } catch (Exception ex) {
    return Map.of("success", false, "message", "Payment verification failed");
  }
}
```

**Test:** 
- Invalid payment ID → returns failure
- Valid Stripe charge → verifies and updates booking

---

### Priority 3: Add Admin Authorization Checks (CRITICAL)
**Status:** 🔴 MUST FIX IMMEDIATELY  
**Time:** 30 minutes  
**Files:**
- `backend/src/main/java/com/rydex/backend/controller/AdminController.java`

**Current Code (BROKEN):**
```java
@GetMapping("/dashboard")
public Map<String, Object> dashboard() {  // ❌ No auth check
```

**Fixed Code:**
```java
@GetMapping("/dashboard")
@PreAuthorize("hasRole('ADMIN')")  // ✅ Add this annotation
public Map<String, Object> dashboard(Authentication auth) {
  // Verify user is admin
  if (!auth.getAuthorities().stream()
      .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
    throw new AccessDeniedException("Admin access required");
  }
  // ... rest of code
}
```

**Apply To All Admin Endpoints:**
- `/api/admin/dashboard`
- `/api/admin/earnings`
- `/api/admin/vendors/*`
- `/api/admin/vehicles/*`

---

### Priority 4: Fix Socket Authentication (CRITICAL)
**Status:** 🔴 MUST FIX IMMEDIATELY  
**Time:** 1-2 hours  
**Files:**
- `socketServer/index.js`

**Current Code (BROKEN):**
```javascript
socket.on("identity", async (userId) => {
  socket.userId = userId  // ❌ No verification
  await User.findByIdAndUpdate(userId, {
    socketId: socket.id,
    isOnline: true
  })
})
```

**Fixed Code:**
```javascript
import jwt from 'jsonwebtoken';

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.uid;  // ✅ From verified JWT
    socket.userRole = decoded.role;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

socket.on("identity", async (userId) => {
  // ✅ Verify user is connecting to their own socket
  if (socket.userId !== userId) {
    socket.emit('error', 'Unauthorized');
    return;
  }
  
  await User.findByIdAndUpdate(socket.userId, {
    socketId: socket.id,
    isOnline: true
  });
});
```

---

### Priority 5: Remove Hardcoded JWT Secret (CRITICAL)
**Status:** 🔴 MUST FIX IMMEDIATELY  
**Time:** 15 minutes  
**Files:**
- `rydex/src/auth.ts`

**Current Code (BROKEN):**
```typescript
if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
  process.env.AUTH_SECRET = "rydex-dev-secret"  // ❌ Hardcoded fallback
}
```

**Fixed Code:**
```typescript
if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
  throw new Error(
    "AUTH_SECRET environment variable must be set. " +
    "Generate with: openssl rand -base64 32"
  );
}
```

**Setup Instructions:**
```bash
# Generate secure secret (do this once)
openssl rand -base64 32
# Output: abc123def456ghi789... (copy this)

# Add to .env.local
AUTH_SECRET=abc123def456ghi789...
```

---

### Priority 6: Add OTP Rate Limiting & Hashing (HIGH)
**Status:** 🟠 HIGH PRIORITY  
**Time:** 2-3 hours  
**Files:**
- `rydex/src/app/api/partner/bookings/verify-pickup-otp/route.ts`
- `rydex/src/models/booking.model.ts`

**Required Changes:**

1. Hash OTP on generation:
```typescript
import crypto from 'crypto';

const otp = generateOTP();  // "123456"
const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
await booking.updateOne({ pickupOtp: hashedOtp });
```

2. Use constant-time comparison:
```typescript
import crypto from 'crypto';

// ✅ Constant-time comparison (prevents timing attacks)
const isValidOtp = crypto.timingSafeEqual(
  Buffer.from(hashedOtp),
  Buffer.from(crypto.createHash('sha256').update(otp).digest('hex'))
);
```

3. Add rate limiting:
```typescript
import rateLimit from 'express-rate-limit';

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,  // 5 attempts
  message: 'Too many OTP attempts, please try again later'
});

app.post('/api/booking/:id/verify-otp', otpLimiter, async (req) => {
  // ... verify otp
});
```

---

### Priority 7: Add Input Validation to Booking Creation (HIGH)
**Status:** 🟠 HIGH PRIORITY  
**Time:** 1 hour  
**Files:**
- `rydex/src/app/api/booking/create/route.ts`

**Add Validation:**
```typescript
// Validate driver exists and belongs to a driver
const driver = await User.findById(driverId);
if (!driver || driver.role !== 'vendor') {
  return NextResponse.json({ error: "Invalid driver" }, { status: 400 });
}

// Validate vehicle exists and belongs to driver
const vehicle = await Vehicle.findById(vehicleId);
if (!vehicle || vehicle.driver.toString() !== driverId) {
  return NextResponse.json({ error: "Invalid vehicle" }, { status: 400 });
}

// Validate fare
if (!fare || fare < 50 || fare > 10000) {
  return NextResponse.json({ error: "Invalid fare (50-10000)" }, { status: 400 });
}

// Validate locations have valid coordinates
if (!isValidCoordinates(pickupLocation) || !isValidCoordinates(dropLocation)) {
  return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
}

function isValidCoordinates([lng, lat]) {
  return typeof lng === 'number' && typeof lat === 'number' &&
         lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
}
```

---

### Priority 8: Implement Request Authorization Checks (HIGH)
**Status:** 🟠 HIGH PRIORITY  
**Time:** 2 hours  
**Files:**
- `rydex/src/app/api/partner/bookings/verify-pickup-otp/route.ts`
- `rydex/src/app/api/booking/[id]/verify-pin/route.ts`
- Other booking endpoints

**Pattern to Apply Everywhere:**
```typescript
// ✅ ALWAYS verify user owns the resource they're accessing
export async function POST(req: Request) {
  const session = await auth();
  const { bookingId } = await req.json();
  
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // ✅ Critical: Check user owns this resource
  if (booking.driver.toString() !== session.user.id && 
      booking.user.toString() !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  
  // ... rest of logic
}
```

---

### Priority 9: Encrypt Sensitive Data (HIGH)
**Status:** 🟠 HIGH PRIORITY  
**Time:** 3-4 hours  
**Files:**
- `rydex/src/models/booking.model.ts`
- `rydex/src/models/user.model.ts`

**Implementation:**
```typescript
import crypto from 'crypto';

// For mobile numbers and OTPs
export function encryptField(plaintext: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decryptField(encrypted: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// In schema pre-save hooks
bookingSchema.pre('save', async function() {
  if (this.isModified('userMobileNumber')) {
    this.userMobileNumber = encryptField(this.userMobileNumber);
  }
  if (this.isModified('driverMobileNumber')) {
    this.driverMobileNumber = encryptField(this.driverMobileNumber);
  }
});
```

---

### Priority 10: Implement Race Condition Fix (HIGH)
**Status:** 🟠 HIGH PRIORITY  
**Time:** 1-2 hours  
**Files:**
- `rydex/src/app/api/booking/create/route.ts`

**Current Code (BROKEN):**
```typescript
const existing = await Booking.findOne({...});  // Check
if (existing) return ...;

const booking = await Booking.create({...});     // Then act - RACE CONDITION
```

**Fixed Code (Use MongoDB Transaction):**
```typescript
import { startSession } from 'mongoose';

export async function POST(req: Request) {
  const session = await startSession();
  session.startTransaction();
  
  try {
    // Create booking with transaction
    const booking = await Booking.create(
      [{
        user: session.user.id,
        driver: driverId,
        vehicle: vehicleId,
        // ... other fields
      }],
      { session }
    );
    
    // Update user with transaction
    await User.findByIdAndUpdate(
      session.user.id,
      { lastBooking: booking[0]._id },
      { session }
    );
    
    await session.commitTransaction();
    return NextResponse.json({ success: true, booking: booking[0] });
  } catch (error) {
    await session.abortTransaction();
    return NextResponse.json({ error: "Creation failed" }, { status: 500 });
  } finally {
    await session.endSession();
  }
}
```

---

## Verification Checklist

After implementing fixes, verify with:

```bash
# 1. Authorization bypass test
curl -X GET http://localhost:8080/api/booking/123 
# Should return 401 Unauthorized (not 200)

# 2. Admin endpoint protection
curl -X GET http://localhost:8080/api/admin/dashboard \
  -H "Authorization: Bearer USER_TOKEN"
# Should return 403 Forbidden (user token shouldn't work)

# 3. Socket authentication
# Try connecting without JWT token - should fail
# Try connecting with invalid token - should fail
# Try connecting with valid token - should succeed

# 4. Payment verification
curl -X POST http://localhost:8080/api/payment/verify \
  -H "Content-Type: application/json" \
  -d '{"chargeId": "invalid_id"}'
# Should return { success: false, message: "..." }

# 5. OTP rate limiting
for i in {1..6}; do
  curl -X POST http://localhost:48752/api/booking/123/verify-otp \
    -H "Content-Type: application/json" \
    -d '{"otp": "123456"}'
done
# Requests 6-10 should return 429 Too Many Requests
```

---

## Deployment Gate Checklist

Do NOT deploy to production until:

- [ ] Authorization bypass fixed (✅ verify with curl)
- [ ] Payment verification implemented
- [ ] Admin auth checks added
- [ ] Socket authentication working
- [ ] Hardcoded secrets removed
- [ ] All critical endpoints tested
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Rate limiting enabled
- [ ] Logging/monitoring in place
- [ ] Secrets management (env vars) configured
- [ ] Database backups automated
- [ ] Incident response plan documented

---

## Quick Diff Summary

| Issue | File | Change | Impact |
|-------|------|--------|--------|
| Auth bypass | SecurityConfig.java | `permitAll()` → `authenticated()` | 🔴 CRITICAL |
| Payment stub | PaymentController.java | Add Stripe API call | 🔴 CRITICAL |
| Admin auth | AdminController.java | Add `@PreAuthorize` | 🔴 CRITICAL |
| Socket auth | index.js | Add JWT verification | 🔴 CRITICAL |
| Hardcoded secret | auth.ts | Remove fallback | 🔴 CRITICAL |
| OTP rate limit | route.ts | Add rate limiter middleware | 🟠 HIGH |
| Input validation | booking routes | Add validation checks | 🟠 HIGH |
| Resource checks | All routes | Add user ownership check | 🟠 HIGH |
| Encryption | Models | Encrypt PII fields | 🟠 HIGH |
| Race condition | booking/create | Add transaction | 🟠 HIGH |

---

**Generated:** April 25, 2026

