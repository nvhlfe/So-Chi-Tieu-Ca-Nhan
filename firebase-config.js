// Config Firebase của bạn (lấy từ Firebase Console → Project settings → SDK setup and configuration).
// Đây KHÔNG phải là bí mật cần giấu — Firebase config luôn công khai trong code frontend,
// việc bảo vệ dữ liệu nằm ở Firestore Security Rules (xem README), không nằm ở việc giấu file này.

export const firebaseConfig = {
  apiKey: "AIzaSyCDxRfp81T3BPccA0eZbgBFlHg0Qyb1Ytc",
  authDomain: "so-thu-chi-the-tin-dung.firebaseapp.com",
  projectId: "so-thu-chi-the-tin-dung",
  storageBucket: "so-thu-chi-the-tin-dung.firebasestorage.app",
  messagingSenderId: "759680136538",
  appId: "1:759680136538:web:91ae330660becc1894ef63",
};
