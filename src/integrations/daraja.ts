import axios from 'axios';

const DARIJA_BASE = 'https://sandbox.safaricom.co.ke/mpesa';
const CONSUMER_KEY = import.meta.env.VITE_DARIJA_CONSUMER_KEY;
const CONSUMER_SECRET = import.meta.env.VITE_DARIJA_CONSUMER_SECRET;
const PASSKEY = import.meta.env.VITE_DARIJA_PASSKEY;
const SHORTCODE = '174379'; // Sandbox default

let ACCESS_TOKEN = '';

async function getToken(): Promise<string> {
  if (ACCESS_TOKEN && Date.now() < Number(ACCESS_TOKEN.expires)) {
    return ACCESS_TOKEN.token;
  }
  
  const { data } = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    auth: {
      username: CONSUMER_KEY!,
      password: CONSUMER_SECRET!,
    },
  });
  
  ACCESS_TOKEN = {
    token: data.access_token,
    expires: Date.now() + data.expires_in * 1000,
  };
  
  return data.access_token;
}

export async function initiateSTKPush(phone: string, amount: number) {
  try {
    const token = await getToken();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '');
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');
    
    const stkData = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: `${window.location.origin}/api/mpesa/callback`,
      AccountReference: 'PulseMarket',
      TransactionDesc: 'Deposit to wallet',
    };
    
    const { data } = await axios.post(
      `${DARIJA_BASE}/c2b/v1/registerurl`,
      {
        ShortCode: SHORTCODE,
        ResponseType: 'Completed',
        ConfirmationURL: `${window.location.origin}/api/mpesa/confirmation`,
        ValidationURL: `${window.location.origin}/api/mpesa/validation`,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    const { data: pushData } = await axios.post(
      `${DARIJA_BASE}/stkpush/v1/processrequest`,
      stkData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    return { success: true, checkoutId: pushData.CheckoutRequestID };
  } catch (error: any) {
    console.error('STK Push failed:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errorMessage || 'STK Push failed');
  }
}

