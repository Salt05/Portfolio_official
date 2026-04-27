import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAhx0_1d8PQUkhJwVJ8exqePHZ74EG1Rd8",
  authDomain: "numstrata-989ce.firebaseapp.com",
  projectId: "numstrata-989ce",
  storageBucket: "numstrata-989ce.firebasestorage.app",
  messagingSenderId: "278330878957",
  appId: "1:278330878957:web:a50f716076124f50eb95e4",
  measurementId: "G-NBBC37NCGV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper to create a full matrix (36 elements true)
const fullMatrix = () => Array(36).fill(true);
// Helper to create an empty matrix (36 elements false)
const emptyMatrix = () => Array(36).fill(false);

const CAMPAIGN_LEVELS = [
  {
    id: 1, name: 'Khởi Đầu', desc: 'Cộng & Trừ cơ bản', rows: 6, cols: 6,
    layers: [
      {
        equations: [
          { a: 1, op: '+', b: 7, c: 8 },
          { a: 2, op: '+', b: 4, c: 6 },
          { a: 9, op: '-', b: 5, c: 4 },
          { a: 5, op: '-', b: 2, c: 3 },
        ],
        spawnMatrix: fullMatrix()
      }
    ]
  },
  {
    id: 2, name: 'Nhân Bản', desc: 'Thêm phép nhân & Layer 1', rows: 6, cols: 6,
    layers: [
      {
        equations: [
          { a: 2, op: '×', b: 3, c: 6 },
          { a: 4, op: '+', b: 5, c: 9 },
          { a: 8, op: '-', b: 3, c: 5 },
          { a: 7, op: '-', b: 4, c: 3 },
          { a: 1, op: '+', b: 7, c: 8 },
        ],
        spawnMatrix: fullMatrix()
      },
      {
        equations: [{ a: 6, op: '-', b: 3, c: 3 }],
        spawnMatrix: emptyMatrix().map((_, i) => {
          const r = Math.floor(i / 6);
          const c = i % 6;
          return r >= 2 && r <= 3 && c >= 2 && c <= 3;
        })
      }
    ]
  }
];

async function init() {
  console.log("🚀 Đang khởi tạo dữ liệu CHUẨN MỚI lên Firestore...");
  try {
    for (const level of CAMPAIGN_LEVELS) {
      await setDoc(doc(db, 'levels', String(level.id)), level);
      console.log(`✅ Đã cập nhật Màn ${level.id}: ${level.name} (Multi-layer)`);
    }
    console.log("\n🎉 Xong! Bây giờ bạn có thể dùng Admin để chỉnh sửa vị trí quân.");
    process.exit(0);
  } catch (e) {
    console.error("❌ Lỗi:", e);
    process.exit(1);
  }
}

init();
