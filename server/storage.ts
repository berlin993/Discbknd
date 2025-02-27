import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase"; // Firebase initialize wali file import karo
import { type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUid(uid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  completeLevel(userId: string, levelId: number): Promise<void>;
}

export class FirestoreStorage implements IStorage {
  private usersRef = collection(db, "users"); // Firestore ka users collection

  async getUser(id: string): Promise<User | undefined> {
    const userDoc = await getDoc(doc(this.usersRef, id));
    return userDoc.exists() ? (userDoc.data() as User) : undefined;
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    const q = query(this.usersRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? undefined : (querySnapshot.docs[0].data() as User);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: insertUser.uid, // Firebase ka uid use karein
      ...insertUser,
      currentLevel: 1,
      completedLevels: []
    };
    await setDoc(doc(this.usersRef, user.id), user);
    return user;
  }

  async completeLevel(userId: string, levelId: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const completedLevels = user.completedLevels.includes(levelId) ? user.completedLevels : [...user.completedLevels, levelId];
    const currentLevel = levelId + 1;

    await setDoc(doc(this.usersRef, userId), { ...user, completedLevels, currentLevel }, { merge: true });
  }
}

export const storage = new FirestoreStorage();
