import db from "../utils/dbConnect";
import bcrypt from "bcrypt";
import { RowDataPacket, QueryError } from "mysql2";

interface Iuser {
  id: string;
  name: string;
  password: string;
  created_at: string;
}

const selectUsers = (
  callback: (err: Error | null, result?: Iuser[]) => void
): void => {
  const query = "SELECT * FROM users";

  db.query(query, (err, result: RowDataPacket[]) => {
    if (err) {
      console.error("users 테이블을 가져오지 못했습니다.", err);
      return callback(err);
    }
    callback(null, result as Iuser[]);
  });
};

const duplicateId = (
  id: string,
  callback: (err: QueryError | null, isUnique?: boolean) => void
): void => {
  const query = `
    SELECT id 
    FROM users 
    WHERE id = ? 
    GROUP BY id 
    HAVING COUNT(*) = 1
  `;
  db.query<RowDataPacket[]>(query, [id], (err, result) => {
    if (err) {
      console.error("아이디 중복조회 중 오류가 발생했습니다.", err);
      return callback(err);
    }

    const isUnique = result.length > 0;
    callback(null, isUnique);
  });
};

const selectUserById = (
  id: string,
  callback: (err: Error | null, result?: Iuser[]) => void
): void => {
  const query = "SELECT * FROM users WHERE id = ?";

  db.query(query, [id], (err, result: RowDataPacket[]) => {
    if (err) {
      console.error("사용자를 조회하는데 오류가 발생했습니다.", err);
      return callback(err);
    }
    callback(null, result as Iuser[]);
  });
};

const insertUser = async (
  userData: { id: string; name: string; password: string },
  callback: (err: Error | null, result?: any) => void
): Promise<void> => {
  try {
    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const query = "INSERT INTO users (id, name, password) VALUES(?, ?, ?)";
    db.query(
      query,
      [userData.id, userData.name, hashedPassword],
      (err, result) => {
        if (err) {
          console.error("users 테이블에 추가하지 못했습니다.", err);
          return callback(err);
        }
        callback(null, result);
      }
    );
  } catch (error) {
    console.error("비밀번호 암호화 중 오류가 발생했습니다.", error);
    callback(error as Error);
  }
};

export default { selectUsers, selectUserById, insertUser, duplicateId };
