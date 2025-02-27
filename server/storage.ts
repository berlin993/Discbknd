import { users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUid(uid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  completeLevel(userId: number, levelId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.uid === uid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      id,
      ...insertUser,
      currentLevel: 1,
      completedLevels: []
    };
    this.users.set(id, user);
    return user;
  }

  async completeLevel(userId: number, levelId: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    // Only add to completed levels if not already completed
    const completedLevels = user.completedLevels.includes(levelId) 
      ? user.completedLevels 
      : [...user.completedLevels, levelId];

    // Move to next level
    const currentLevel = levelId + 1;

    this.users.set(userId, {
      ...user,
      completedLevels,
      currentLevel
    });
  }
}

export const storage = new MemStorage();