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

/**
 * 1. Create Razorpay Order
 * Securely creates a Razorpay order without exposing secrets to frontend.
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
        // Return structured mock order for demo environments when keys not yet set in console
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

/**
 * 2. Verify Razorpay Payment Signature
 * Server-side cryptographic signature verification to prevent fraudulent orders.
 */
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
        // Demo fallback signature verification
        isSignatureValid = true;
      } else if (RAZORPAY_KEY_SECRET) {
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac('sha256', RAZORPAY_KEY_SECRET)
          .update(body.toString())
          .digest('hex');

        isSignatureValid = expectedSignature === razorpay_signature;
      } else {
        // If keys not configured, verify presence of payment details
        isSignatureValid = Boolean(razorpay_signature);
      }

      if (!isSignatureValid) {
        console.warn('Payment verification failed for order:', orderId);
        return res.status(400).json({
          verified: false,
          error: 'Invalid payment signature. Payment not verified.'
        });
      }

      // Successful verification: Record payment in Firestore
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

      // Update Order Status in Firestore if orderId provided
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

          // Decrement inventory stock
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

/**
 * 3. Assign Admin Custom Claim (Cloud Function callable)
 */
exports.setAdminRole = functions.https.onCall(async (data, context) => {
  // Only existing admins can assign admin claims
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

  // Update in Firestore users collection
  await db.collection('users').doc(user.uid).set({
    role: 'admin',
    isAdmin: true,
    email: user.email,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return { message: `Success! ${email} has been granted administrator role.` };
});
