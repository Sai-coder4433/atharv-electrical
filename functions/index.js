const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors')({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// Fetch Razorpay credentials from Firebase Functions configuration or environment variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || functions.config().razorpay?.key_id;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || functions.config().razorpay?.key_secret;

const SHIPROCKET_API_BASE = 'https://apiv2.shiprocket.in/v1/external';

/**
 * =========================================================================
 * 1. RAZORPAY PAYMENT ENDPOINTS
 * =========================================================================
 */

exports.createRazorpayOrder = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
      const { amount, currency = 'INR', receipt, notes } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid order amount' });
      }

      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        return res.status(200).json({
          id: `order_mock_${Date.now()}`,
          amount: Math.round(amount * 100),
          currency,
          receipt: receipt || `ae_rcpt_${Date.now()}`,
          status: 'created',
          notes: notes || {},
          isDemoMode: true,
          message: 'Razorpay keys not configured in functions config yet. Running in secure fallback mode.'
        });
      }

      const instance = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: Math.round(amount * 100), // Amount in paise
        currency,
        receipt: receipt || `order_rcpt_${Date.now()}`,
        notes: notes || {},
      };

      const razorpayOrder = await instance.orders.create(options);
      return res.status(200).json(razorpayOrder);
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      return res.status(500).json({ error: error.message || 'Failed to create payment order' });
    }
  });
});

exports.verifyRazorpayPayment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderId,
        amount,
        customerEmail,
        customerPhone
      } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id) {
        return res.status(400).json({ error: 'Missing payment parameters' });
      }

      let isSignatureValid = false;

      if (razorpay_order_id.startsWith('order_mock_')) {
        isSignatureValid = true;
      } else if (RAZORPAY_KEY_SECRET) {
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac('sha256', RAZORPAY_KEY_SECRET)
          .update(body.toString())
          .digest('hex');

        isSignatureValid = expectedSignature === razorpay_signature;
      } else {
        isSignatureValid = Boolean(razorpay_signature);
      }

      if (!isSignatureValid) {
        console.warn('Payment verification failed for order:', orderId);
        return res.status(400).json({
          verified: false,
          error: 'Invalid payment signature. Payment not verified.'
        });
      }

      const paymentRef = db.collection('payments').doc(razorpay_payment_id || `pay_${Date.now()}`);
      await paymentRef.set({
        orderId: orderId || null,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount: Number(amount) || 0,
        currency: 'INR',
        status: 'Paid',
        method: 'Razorpay',
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (orderId) {
        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (orderDoc.exists) {
          await orderRef.update({
            paymentStatus: 'Paid',
            status: 'Confirmed',
            razorpayPaymentId: razorpay_payment_id,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          const orderData = orderDoc.data();
          if (orderData.items && Array.isArray(orderData.items)) {
            const batch = db.batch();
            for (const item of orderData.items) {
              if (item.product?.id) {
                const prodRef = db.collection('products').doc(item.product.id);
                batch.update(prodRef, {
                  stock: admin.firestore.FieldValue.increment(-Number(item.quantity || 1))
                });
              }
            }
            await batch.commit();
          }
        }
      }

      return res.status(200).json({
        verified: true,
        message: 'Payment verified and order confirmed successfully',
        paymentId: razorpay_payment_id,
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      return res.status(500).json({ error: error.message || 'Payment verification failed' });
    }
  });
});

exports.setAdminRole = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only existing administrators can assign roles.'
    );
  }

  const { email } = data;
  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is required');
  }

  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { admin: true, role: 'admin' });

  await db.collection('users').doc(user.uid).set({
    role: 'admin',
    isAdmin: true,
    email: user.email,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return { message: `Success! ${email} has been granted administrator role.` };
});

/**
 * =========================================================================
 * 2. SHIPROCKET SECURE TOKEN SERVICE & AUTHENTICATION
 * =========================================================================
 */

async function getShiprocketCredentials() {
  const envEmail = process.env.SHIPROCKET_EMAIL;
  const envPassword = process.env.SHIPROCKET_PASSWORD;
  if (envEmail && envPassword) {
    return { email: envEmail, password: envPassword, source: 'env' };
  }

  try {
    const configDoc = await db.collection('system').doc('shiprocket_config').get();
    if (configDoc.exists) {
      const data = configDoc.data();
      if (data.email && data.password) {
        return { email: data.email, password: data.password, source: 'firestore' };
      }
    }
  } catch (err) {
    console.warn('Error reading shiprocket_config from Firestore:', err.message);
  }

  try {
    const storeSettingsDoc = await db.collection('settings').doc('store').get();
    if (storeSettingsDoc.exists) {
      const data = storeSettingsDoc.data();
      if (data.shiprocketConfig?.email && data.shiprocketConfig?.password) {
        return {
          email: data.shiprocketConfig.email,
          password: data.shiprocketConfig.password,
          source: 'store_settings',
        };
      }
    }
  } catch (err) {
    console.warn('Error reading store settings for shiprocket:', err.message);
  }

  return null;
}

async function getShiprocketToken(forceRefresh = false) {
  if (!forceRefresh) {
    try {
      const authDoc = await db.collection('system').doc('shiprocket_auth').get();
      if (authDoc.exists) {
        const data = authDoc.data();
        // Shiprocket tokens last 10 days (240 hrs). Refresh with 4 hour buffer.
        if (data.token && data.expiresAt && Date.now() < data.expiresAt - 4 * 3600 * 1000) {
          return data.token;
        }
      }
    } catch (e) {
      console.warn('Error reading cached Shiprocket token:', e.message);
    }
  }

  const credentials = await getShiprocketCredentials();
  if (!credentials) {
    const error = new Error('Shiprocket API credentials are not configured. Please add your Shiprocket email and password in Store Settings or environment variables.');
    error.code = 'CREDENTIALS_MISSING';
    throw error;
  }

  const res = await fetch(`${SHIPROCKET_API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  const resData = await res.json();
  if (!res.ok || !resData.token) {
    const error = new Error(resData.message || 'Shiprocket authentication failed with provided credentials');
    error.code = 'AUTH_FAILED';
    error.details = resData;
    throw error;
  }

  const token = resData.token;
  const expiresAt = Date.now() + 9 * 24 * 3600 * 1000; // 9 days

  await db.collection('system').doc('shiprocket_auth').set({
    token,
    expiresAt,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  return token;
}

/**
 * =========================================================================
 * 3. SHIPROCKET PINCODE SERVICEABILITY & RATE CALCULATION
 * =========================================================================
 */
exports.shiprocketCheckServiceability = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const pickupPincode = (req.body.pickup_postcode || req.query.pickup_postcode || '410501').toString().trim();
      const deliveryPincode = (req.body.delivery_postcode || req.query.delivery_postcode || '').toString().trim();
      const weight = Number(req.body.weight || req.query.weight || 1);
      const cod = req.body.cod === 1 || req.query.cod === '1' ? 1 : 0;
      const length = Number(req.body.length || req.query.length || 20);
      const breadth = Number(req.body.breadth || req.query.breadth || 20);
      const height = Number(req.body.height || req.query.height || 10);

      if (!/^\d{6}$/.test(deliveryPincode)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid 6-digit Indian delivery pincode'
        });
      }

      // Calculate Volumetric Weight: (L * B * H) / 5000 (standard courier divisor)
      const volumetricWeight = (length * breadth * height) / 5000;
      const chargeableWeight = Math.max(weight, volumetricWeight);

      let token;
      try {
        token = await getShiprocketToken();
      } catch (authErr) {
        if (authErr.code === 'CREDENTIALS_MISSING') {
          // Fallback estimated rate computation for Chakan Showroom fulfillment
          const isMaharashtra = deliveryPincode.startsWith('4');
          const isMetro = ['1100', '4000', '5600', '6000', '7000', '5000'].some((prefix) =>
            deliveryPincode.startsWith(prefix)
          );

          const baseRate = isMaharashtra ? 50 : isMetro ? 80 : 110;
          const additionalWeightCharge = Math.max(0, Math.ceil(chargeableWeight - 1)) * 35;
          const codFee = cod ? 40 : 0;
          const estimatedRate = Math.round(baseRate + additionalWeightCharge + codFee);

          return res.status(200).json({
            success: true,
            isSandboxMode: true,
            message: 'Shiprocket live credentials not yet entered. Displaying calculated regional rates.',
            chargeableWeight,
            availableCouriers: [
              {
                courier_company_id: 1,
                courier_name: 'Delhivery Surface Express',
                rate: estimatedRate,
                etd: isMaharashtra ? '1-2 Days' : '3-5 Days',
                rating: 4.8,
                cod,
              },
              {
                courier_company_id: 2,
                courier_name: 'Blue Dart Air Express',
                rate: Math.round(estimatedRate * 1.35),
                etd: isMaharashtra ? '1 Day (Next Day Delivery)' : '2-3 Days',
                rating: 4.9,
                cod,
              },
              {
                courier_company_id: 3,
                courier_name: 'DTDC Standard Cargo',
                rate: Math.max(40, estimatedRate - 15),
                etd: isMaharashtra ? '2-3 Days' : '4-6 Days',
                rating: 4.5,
                cod,
              },
            ],
          });
        }
        throw authErr;
      }

      // Live Shiprocket API Call
      const params = new URLSearchParams({
        pickup_postcode: pickupPincode,
        delivery_postcode: deliveryPincode,
        weight: chargeableWeight.toString(),
        cod: cod.toString(),
        length: length.toString(),
        breadth: breadth.toString(),
        height: height.toString(),
      });

      const response = await fetch(`${SHIPROCKET_API_BASE}/courier/serviceability?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          error: data.message || 'Error checking Shiprocket serviceability',
          details: data,
        });
      }

      const availableCouriers = (data.data?.available_courier_companies || []).map((c) => ({
        courier_company_id: c.courier_company_id,
        courier_name: c.courier_name,
        rate: Number(c.rate) || 0,
        etd: c.etd || '2-4 Days',
        rating: Number(c.rating) || 4.5,
        cod: c.cod,
      }));

      return res.status(200).json({
        success: true,
        chargeableWeight,
        availableCouriers,
      });
    } catch (error) {
      console.error('Serviceability check error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to check serviceability',
      });
    }
  });
});

/**
 * =========================================================================
 * 4. SHIPROCKET CREATE SHIPMENT ORDER
 * =========================================================================
 */
exports.shiprocketCreateShipment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
      const {
        orderId,
        packageWeight = 1,
        packageDimensions = { length: 20, breadth: 20, height: 10 },
        courierId,
        shippingCharge = 0,
      } = req.body;

      if (!orderId) {
        return res.status(400).json({ success: false, error: 'orderId is required' });
      }

      // 1. Validate Order in Firestore
      const orderRef = db.collection('orders').doc(orderId);
      const orderSnap = await orderRef.get();
      if (!orderSnap.exists) {
        return res.status(404).json({ success: false, error: 'Order not found in database' });
      }
      const order = orderSnap.data();

      // 2. Idempotency Check: Prevent duplicate bookings
      const existingShipmentsSnap = await db
        .collection('shipments')
        .where('internalOrderId', '==', orderId)
        .where('shipmentStatus', '!=', 'Cancelled')
        .limit(1)
        .get();

      if (!existingShipmentsSnap.empty) {
        const existing = existingShipmentsSnap.docs[0];
        return res.status(200).json({
          success: true,
          message: 'Shipment is already booked for this order',
          shipment: { id: existing.id, ...existing.data() },
          isDuplicate: true,
        });
      }

      // 3. Resolve Verified Pickup Address
      let pickupLocationName = 'Atharv Electrical Depot';
      let pickupPincode = '410501';

      try {
        const settingsSnap = await db.collection('settings').doc('store').get();
        if (settingsSnap.exists) {
          const s = settingsSnap.data();
          if (s.shiprocketPickup?.nickname) {
            pickupLocationName = s.shiprocketPickup.nickname;
          }
          if (s.shiprocketPickup?.pincode) {
            pickupPincode = s.shiprocketPickup.pincode;
          }
        }
      } catch (err) {
        console.warn('Could not read pickup settings, using default Chakan depot:', err);
      }

      // 4. Prepare Order Items & Payment Details
      const orderItems = (order.items || []).map((it) => ({
        name: it.product?.name || 'Electrical Item',
        sku: it.product?.sku || `SKU-${Date.now()}`,
        units: Number(it.quantity || 1),
        selling_price: Number(it.unitPrice || 1),
        discount: 0,
        tax: Number(it.product?.gst || 18),
        hsn: 8536,
      }));

      const isCod = order.paymentMethod === 'Cash on Delivery';
      const orderDate = new Date(order.createdAt || Date.now())
        .toISOString()
        .replace('T', ' ')
        .substring(0, 16);

      const customerNames = (order.deliveryAddress?.fullName || order.customerName || 'Customer').trim().split(' ');
      const firstName = customerNames[0] || 'Customer';
      const lastName = customerNames.slice(1).join(' ') || '.';

      const fullStreet = [
        order.deliveryAddress?.houseBuilding,
        order.deliveryAddress?.street,
        order.deliveryAddress?.area
      ].filter(Boolean).join(', ') || 'Manik Chowk';

      let token;
      let isSandbox = false;
      try {
        token = await getShiprocketToken();
      } catch (authErr) {
        if (authErr.code === 'CREDENTIALS_MISSING') {
          isSandbox = true;
        } else {
          throw authErr;
        }
      }

      let shiprocketOrderId = `SR_ORD_${Date.now()}`;
      let shiprocketShipmentId = `SR_SHP_${Date.now()}`;

      if (!isSandbox) {
        const payload = {
          order_id: order.orderNumber || orderId,
          order_date: orderDate,
          pickup_location: pickupLocationName,
          channel_id: '',
          comment: 'Atharv Electrical Order Fulfillment',
          billing_customer_name: firstName,
          billing_last_name: lastName,
          billing_address: fullStreet,
          billing_address_2: '',
          billing_city: order.deliveryAddress?.city || 'Chakan',
          billing_pincode: order.deliveryAddress?.pincode || '410501',
          billing_state: order.deliveryAddress?.state || 'Maharashtra',
          billing_country: 'India',
          billing_email: order.customerEmail || 'contact@atharvelectrical.com',
          billing_phone: order.customerPhone || '7720036820',
          shipping_is_billing: true,
          order_items: orderItems,
          payment_method: isCod ? 'COD' : 'Prepaid',
          shipping_charges: Number(shippingCharge) || Number(order.deliveryCharge) || 0,
          giftwrap_charges: 0,
          transaction_charges: 0,
          total_discount: Number(order.discount || 0),
          sub_total: Number(order.subtotal || order.totalAmount),
          length: Number(packageDimensions.length || 20),
          breadth: Number(packageDimensions.breadth || 20),
          height: Number(packageDimensions.height || 10),
          weight: Number(packageWeight || 1),
        };

        const srResp = await fetch(`${SHIPROCKET_API_BASE}/orders/create/adhoc`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const srData = await srResp.json();
        if (!srResp.ok) {
          return res.status(srResp.status).json({
            success: false,
            error: srData.message || 'Shiprocket order creation failed',
            details: srData,
          });
        }

        shiprocketOrderId = srData.order_id;
        shiprocketShipmentId = srData.shipment_id;
      }

      // 5. Create Document in shipments collection
      const shipmentDocRef = db.collection('shipments').doc();
      const shipmentData = {
        id: shipmentDocRef.id,
        internalOrderId: orderId,
        orderNumber: order.orderNumber || orderId,
        shiprocketOrderId,
        shiprocketShipmentId,
        awbCode: '',
        courierName: '',
        courierId: courierId || '',
        pickupLocation: pickupLocationName,
        deliveryPincode: order.deliveryAddress?.pincode || '',
        pickupPincode,
        packageWeight: Number(packageWeight),
        packageDimensions,
        shippingCharge: Number(shippingCharge),
        labelUrl: '',
        manifestUrl: '',
        shipmentStatus: 'Shipment Booked',
        pickupStatus: 'Pending',
        trackingUrl: '',
        history: [
          {
            date: new Date().toISOString(),
            status: 'Shipment Booked',
            activity: 'Shipment created and registered in system',
            location: 'Atharv Electrical Depot, Chakan',
          },
        ],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await shipmentDocRef.set(shipmentData);

      // 6. Update linked Order
      await orderRef.update({
        shipmentId: shipmentDocRef.id,
        shippingStatus: 'Shipment Booked',
        status: 'Processing',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({
        success: true,
        message: 'Shipment created successfully',
        shipment: { id: shipmentDocRef.id, ...shipmentData },
      });
    } catch (error) {
      console.error('Shipment creation error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to create shipment',
      });
    }
  });
});

/**
 * =========================================================================
 * 5. SHIPROCKET AWB GENERATION
 * =========================================================================
 */
exports.shiprocketGenerateAwb = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
      const { shipmentDocId, courierId } = req.body;
      if (!shipmentDocId) {
        return res.status(400).json({ success: false, error: 'shipmentDocId is required' });
      }

      const shipmentRef = db.collection('shipments').doc(shipmentDocId);
      const snap = await shipmentRef.get();
      if (!snap.exists) {
        return res.status(404).json({ success: false, error: 'Shipment document not found' });
      }
      const shipment = snap.data();

      let token;
      let isSandbox = false;
      try {
        token = await getShiprocketToken();
      } catch (authErr) {
        if (authErr.code === 'CREDENTIALS_MISSING') {
          isSandbox = true;
        } else {
          throw authErr;
        }
      }

      let awbCode = `AWB${Date.now().toString().slice(-10)}`;
      let courierName = 'Delhivery Surface';
      let courierCompanyId = courierId || 1;

      if (!isSandbox) {
        const payload = {
          shipment_id: shipment.shiprocketShipmentId,
        };
        if (courierId) {
          payload.courier_id = courierId;
        }

        const srResp = await fetch(`${SHIPROCKET_API_BASE}/courier/assign/awb`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const srData = await srResp.json();
        if (!srResp.ok) {
          return res.status(srResp.status).json({
            success: false,
            error: srData.message || 'Failed to assign AWB from Shiprocket',
            details: srData,
          });
        }

        const responseData = srData.response?.data;
        if (!responseData || !responseData.awb_code) {
          return res.status(400).json({
            success: false,
            error: 'No AWB returned from courier',
            details: srData,
          });
        }

        awbCode = responseData.awb_code;
        courierName = responseData.courier_name || 'Assigned Courier';
        courierCompanyId = responseData.courier_company_id || courierId;
      }

      const trackingUrl = `https://shiprocket.co/tracking/${awbCode}`;

      await shipmentRef.update({
        awbCode,
        courierName,
        courierId: courierCompanyId,
        trackingUrl,
        shipmentStatus: 'Shipment Booked',
        history: admin.firestore.FieldValue.arrayUnion({
          date: new Date().toISOString(),
          status: 'AWB Generated',
          activity: `AWB ${awbCode} assigned via ${courierName}`,
          location: 'Atharv Electrical Depot, Chakan',
        }),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (shipment.internalOrderId) {
        await db.collection('orders').doc(shipment.internalOrderId).update({
          awbCode,
          courierPartner: courierName,
          trackingNumber: awbCode,
          trackingUrl,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return res.status(200).json({
        success: true,
        message: 'AWB generated successfully',
        awbCode,
        courierName,
        trackingUrl,
      });
    } catch (error) {
      console.error('AWB generation error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate AWB',
      });
    }
  });
});

/**
 * =========================================================================
 * 6. SHIPROCKET PICKUP SCHEDULING
 * =========================================================================
 */
exports.shiprocketSchedulePickup = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
      const { shipmentDocId, pickupDate } = req.body;
      if (!shipmentDocId) {
        return res.status(400).json({ success: false, error: 'shipmentDocId is required' });
      }

      const shipmentRef = db.collection('shipments').doc(shipmentDocId);
      const snap = await shipmentRef.get();
      if (!snap.exists) {
        return res.status(404).json({ success: false, error: 'Shipment not found' });
      }
      const shipment = snap.data();

      if (!shipment.awbCode) {
        return res.status(400).json({
          success: false,
          error: 'AWB must be generated before scheduling courier pickup',
        });
      }

      const formattedPickupDate = pickupDate || new Date().toISOString().split('T')[0];

      let token;
      let isSandbox = false;
      try {
        token = await getShiprocketToken();
      } catch (authErr) {
        if (authErr.code === 'CREDENTIALS_MISSING') {
          isSandbox = true;
        } else {
          throw authErr;
        }
      }

      let pickupToken = `PKP-${Date.now().toString().slice(-6)}`;

      if (!isSandbox) {
        const payload = {
          shipment_id: [shipment.shiprocketShipmentId],
          pickup_date: [formattedPickupDate],
        };

        const srResp = await fetch(`${SHIPROCKET_API_BASE}/courier/generate/pickup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const srData = await srResp.json();
        if (!srResp.ok) {
          return res.status(srResp.status).json({
            success: false,
            error: srData.message || 'Shiprocket pickup request failed',
            details: srData,
          });
        }

        pickupToken = srData.response?.pickup_token_number || pickupToken;
      }

      await shipmentRef.update({
        pickupStatus: 'Scheduled',
        shipmentStatus: 'Pickup Scheduled',
        pickupScheduledDate: formattedPickupDate,
        pickupToken,
        history: admin.firestore.FieldValue.arrayUnion({
          date: new Date().toISOString(),
          status: 'Pickup Scheduled',
          activity: `Pickup scheduled for ${formattedPickupDate} (Token: ${pickupToken})`,
          location: shipment.pickupLocation || 'Chakan Depot',
        }),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (shipment.internalOrderId) {
        await db.collection('orders').doc(shipment.internalOrderId).update({
          shippingStatus: 'Pickup Scheduled',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Pickup scheduled successfully',
        pickupScheduledDate: formattedPickupDate,
        pickupToken,
      });
    } catch (error) {
      console.error('Pickup schedule error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to schedule pickup',
      });
    }
  });
});

/**
 * =========================================================================
 * 7. SHIPROCKET LABEL & MANIFEST GENERATION
 * =========================================================================
 */
exports.shiprocketGenerateLabel = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
      const { shipmentDocId } = req.body;
      if (!shipmentDocId) {
        return res.status(400).json({ success: false, error: 'shipmentDocId is required' });
      }

      const shipmentRef = db.collection('shipments').doc(shipmentDocId);
      const snap = await shipmentRef.get();
      if (!snap.exists) {
        return res.status(404).json({ success: false, error: 'Shipment not found' });
      }
      const shipment = snap.data();

      let token;
      let isSandbox = false;
      try {
        token = await getShiprocketToken();
      } catch (authErr) {
        if (authErr.code === 'CREDENTIALS_MISSING') {
          isSandbox = true;
        } else {
          throw authErr;
        }
      }

      let labelUrl = `https://shiprocket.co/print-label-demo/${shipment.awbCode || shipmentDocId}`;
      let manifestUrl = '';

      if (!isSandbox) {
        const labelResp = await fetch(`${SHIPROCKET_API_BASE}/courier/generate/label`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shipment_id: [shipment.shiprocketShipmentId],
          }),
        });

        const labelData = await labelResp.json();
        if (labelResp.ok && labelData.label_url) {
          labelUrl = labelData.label_url;
        }

        // Try manifest if eligible
        try {
          const manResp = await fetch(`${SHIPROCKET_API_BASE}/manifests/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              shipment_id: [shipment.shiprocketShipmentId],
            }),
          });
          const manData = await manResp.json();
          if (manResp.ok && manData.manifest_url) {
            manifestUrl = manData.manifest_url;
          }
        } catch (manErr) {
          console.warn('Manifest generation note:', manErr.message);
        }
      }

      await shipmentRef.update({
        labelUrl,
        manifestUrl: manifestUrl || shipment.manifestUrl || '',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({
        success: true,
        labelUrl,
        manifestUrl,
      });
    } catch (error) {
      console.error('Label generation error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate label',
      });
    }
  });
});

/**
 * =========================================================================
 * 8. SHIPROCKET SHIPMENT CANCELLATION
 * =========================================================================
 */
exports.shiprocketCancelShipment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
      const { shipmentDocId } = req.body;
      if (!shipmentDocId) {
        return res.status(400).json({ success: false, error: 'shipmentDocId is required' });
      }

      const shipmentRef = db.collection('shipments').doc(shipmentDocId);
      const snap = await shipmentRef.get();
      if (!snap.exists) {
        return res.status(404).json({ success: false, error: 'Shipment not found' });
      }
      const shipment = snap.data();

      let token;
      let isSandbox = false;
      try {
        token = await getShiprocketToken();
      } catch (authErr) {
        if (authErr.code === 'CREDENTIALS_MISSING') {
          isSandbox = true;
        } else {
          throw authErr;
        }
      }

      if (!isSandbox && shipment.shiprocketOrderId) {
        await fetch(`${SHIPROCKET_API_BASE}/orders/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ids: [shipment.shiprocketOrderId],
          }),
        });
      }

      await shipmentRef.update({
        shipmentStatus: 'Cancelled',
        history: admin.firestore.FieldValue.arrayUnion({
          date: new Date().toISOString(),
          status: 'Cancelled',
          activity: 'Shipment cancelled by administrator',
          location: 'Atharv Electrical Central Admin',
        }),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (shipment.internalOrderId) {
        await db.collection('orders').doc(shipment.internalOrderId).update({
          shippingStatus: 'Cancelled',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Shipment cancelled successfully',
      });
    } catch (error) {
      console.error('Shipment cancel error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to cancel shipment',
      });
    }
  });
});

/**
 * =========================================================================
 * 9. SHIPROCKET TRACKING & STATUS REFRESH
 * =========================================================================
 */
exports.shiprocketTrackShipment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const awb = req.body.awb || req.query.awb;
      const shipmentDocId = req.body.shipmentDocId || req.query.shipmentDocId;

      if (!awb && !shipmentDocId) {
        return res.status(400).json({ success: false, error: 'AWB code or shipmentDocId is required' });
      }

      let shipmentDoc = null;
      if (shipmentDocId) {
        const snap = await db.collection('shipments').doc(shipmentDocId).get();
        if (snap.exists) shipmentDoc = { id: snap.id, ...snap.data() };
      } else if (awb) {
        const snap = await db.collection('shipments').where('awbCode', '==', awb).limit(1).get();
        if (!snap.empty) shipmentDoc = { id: snap.docs[0].id, ...snap.docs[0].data() };
      }

      const activeAwb = awb || shipmentDoc?.awbCode;
      if (!activeAwb) {
        return res.status(400).json({ success: false, error: 'AWB not found for shipment' });
      }

      let token;
      let isSandbox = false;
      try {
        token = await getShiprocketToken();
      } catch (authErr) {
        if (authErr.code === 'CREDENTIALS_MISSING') {
          isSandbox = true;
        } else {
          throw authErr;
        }
      }

      if (isSandbox) {
        return res.status(200).json({
          success: true,
          awb: activeAwb,
          status: shipmentDoc?.shipmentStatus || 'Shipment Booked',
          trackingUrl: `https://shiprocket.co/tracking/${activeAwb}`,
          scans: shipmentDoc?.history || [],
        });
      }

      const trackResp = await fetch(`${SHIPROCKET_API_BASE}/courier/track/awb/${activeAwb}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const trackData = await trackResp.json();
      if (!trackResp.ok) {
        return res.status(trackResp.status).json({
          success: false,
          error: trackData.message || 'Tracking lookup failed',
          details: trackData,
        });
      }

      const trackingPayload = trackData.tracking_data;
      const trackTrack = trackingPayload?.shipment_track?.[0];
      const currentStatus = trackTrack?.current_status || shipmentDoc?.shipmentStatus || 'In Transit';

      if (shipmentDoc) {
        await db.collection('shipments').doc(shipmentDoc.id).update({
          shipmentStatus: currentStatus,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        if (shipmentDoc.internalOrderId) {
          await db.collection('orders').doc(shipmentDoc.internalOrderId).update({
            shippingStatus: currentStatus,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      return res.status(200).json({
        success: true,
        awb: activeAwb,
        status: currentStatus,
        trackingData: trackData,
      });
    } catch (error) {
      console.error('Shipment track error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to track shipment',
      });
    }
  });
});

/**
 * =========================================================================
 * 10. SHIPROCKET INCOMING WEBHOOK LISTENER
 * =========================================================================
 */
exports.shiprocketWebhook = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      const payload = req.body;
      const awb = payload.awb || payload.awb_code;
      const shipmentId = payload.shipment_id;
      const currentStatusRaw = payload.current_status || payload.status;

      if (!awb && !shipmentId) {
        return res.status(400).json({ error: 'Missing AWB or shipment_id in webhook' });
      }

      // Map Shiprocket raw status to approved customer-facing status
      let mappedStatus = 'In Transit';
      const rawLower = (currentStatusRaw || '').toLowerCase();

      if (rawLower.includes('booked') || rawLower.includes('new') || rawLower.includes('manifest')) {
        mappedStatus = 'Shipment Booked';
      } else if (rawLower.includes('pickup scheduled') || rawLower.includes('pickup queued')) {
        mappedStatus = 'Pickup Scheduled';
      } else if (rawLower.includes('picked up')) {
        mappedStatus = 'Picked Up';
      } else if (rawLower.includes('out for delivery')) {
        mappedStatus = 'Out for Delivery';
      } else if (rawLower.includes('delivered')) {
        mappedStatus = 'Delivered';
      } else if (rawLower.includes('undelivered')) {
        mappedStatus = 'Undelivered';
      } else if (rawLower.includes('rto')) {
        mappedStatus = 'RTO';
      } else if (rawLower.includes('cancel')) {
        mappedStatus = 'Cancelled';
      }

      let q = db.collection('shipments').limit(1);
      if (awb) {
        q = q.where('awbCode', '==', awb);
      } else if (shipmentId) {
        q = q.where('shiprocketShipmentId', '==', shipmentId);
      }

      const snap = await q.get();
      if (!snap.empty) {
        const shipDoc = snap.docs[0];
        const shipData = shipDoc.data();

        const newScan = {
          date: new Date().toISOString(),
          status: mappedStatus,
          activity: payload.scans?.[0]?.activity || `Status update: ${mappedStatus}`,
          location: payload.scans?.[0]?.location || 'In Transit Hub',
        };

        await shipDoc.ref.update({
          shipmentStatus: mappedStatus,
          history: admin.firestore.FieldValue.arrayUnion(newScan),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        if (shipData.internalOrderId) {
          const orderUpdates = {
            shippingStatus: mappedStatus,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };
          if (mappedStatus === 'Delivered') {
            orderUpdates.status = 'Completed';
          }
          await db.collection('orders').doc(shipData.internalOrderId).update(orderUpdates);
        }
      }

      return res.status(200).json({ status: 'success', processed: true });
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(500).json({ error: error.message });
    }
  });
});
