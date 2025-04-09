import { 
  users, 
  type User, 
  type InsertUser,
  categories,
  type Category,
  type InsertCategory,
  activities,
  type Activity,
  type InsertActivity,
  timeEntries,
  type TimeEntry,
  type InsertTimeEntry
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Activity methods
  getActivities(): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  getActivitiesByCategory(categoryId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<boolean>;

  // Time Entry methods
  getTimeEntries(): Promise<TimeEntry[]>;
  getTimeEntry(id: number): Promise<TimeEntry | undefined>;
  getTimeEntriesByActivity(activityId: number): Promise<TimeEntry[]>;
  getTimeEntriesByDateRange(startDate: Date, endDate: Date): Promise<TimeEntry[]>;
  getActiveTimeEntry(): Promise<TimeEntry | undefined>;
  createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: number, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined>;
  deleteTimeEntry(id: number): Promise<boolean>;
  stopActiveTimeEntry(): Promise<TimeEntry | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private activities: Map<number, Activity>;
  private timeEntries: Map<number, TimeEntry>;
  
  private userCurrentId: number;
  private categoryCurrentId: number;
  private activityCurrentId: number;
  private timeEntryCurrentId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.activities = new Map();
    this.timeEntries = new Map();
    
    this.userCurrentId = 1;
    this.categoryCurrentId = 1;
    this.activityCurrentId = 1;
    this.timeEntryCurrentId = 1;

    // Initialize with sample categories
    this.createCategory({ name: "Programming", icon: "ri-code-line", color: "#6D28D9" });
    this.createCategory({ name: "Reading", icon: "ri-book-open-line", color: "#10B981" });
    this.createCategory({ name: "Languages", icon: "ri-translate-2", color: "#F59E0B" });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;

    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Activity methods
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async getActivitiesByCategory(categoryId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.categoryId === categoryId);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityCurrentId++;
    const activity: Activity = { ...insertActivity, id };
    this.activities.set(id, activity);
    return activity;
  }

  async updateActivity(id: number, activityData: Partial<InsertActivity>): Promise<Activity | undefined> {
    const activity = this.activities.get(id);
    if (!activity) return undefined;

    const updatedActivity = { ...activity, ...activityData };
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }

  async deleteActivity(id: number): Promise<boolean> {
    return this.activities.delete(id);
  }

  // Time Entry methods
  async getTimeEntries(): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values());
  }

  async getTimeEntry(id: number): Promise<TimeEntry | undefined> {
    return this.timeEntries.get(id);
  }

  async getTimeEntriesByActivity(activityId: number): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values())
      .filter(entry => entry.activityId === activityId);
  }

  async getTimeEntriesByDateRange(startDate: Date, endDate: Date): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values())
      .filter(entry => {
        const entryStartTime = new Date(entry.startTime);
        return entryStartTime >= startDate && entryStartTime <= endDate;
      });
  }

  async getActiveTimeEntry(): Promise<TimeEntry | undefined> {
    return Array.from(this.timeEntries.values())
      .find(entry => entry.active);
  }

  async createTimeEntry(insertTimeEntry: InsertTimeEntry): Promise<TimeEntry> {
    // If creating an active time entry, deactivate any existing active entry
    if (insertTimeEntry.active) {
      await this.stopActiveTimeEntry();
    }
    
    const id = this.timeEntryCurrentId++;
    const timeEntry: TimeEntry = { ...insertTimeEntry, id };
    this.timeEntries.set(id, timeEntry);
    return timeEntry;
  }

  async updateTimeEntry(id: number, timeEntryData: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined> {
    const timeEntry = this.timeEntries.get(id);
    if (!timeEntry) return undefined;

    // If activating this entry, deactivate any existing active entry
    if (timeEntryData.active && !timeEntry.active) {
      await this.stopActiveTimeEntry();
    }

    const updatedTimeEntry = { ...timeEntry, ...timeEntryData };
    this.timeEntries.set(id, updatedTimeEntry);
    return updatedTimeEntry;
  }

  async deleteTimeEntry(id: number): Promise<boolean> {
    return this.timeEntries.delete(id);
  }

  async stopActiveTimeEntry(): Promise<TimeEntry | undefined> {
    const activeEntry = await this.getActiveTimeEntry();
    if (!activeEntry) return undefined;

    const now = new Date();
    const updatedEntry: TimeEntry = {
      ...activeEntry,
      endTime: now,
      active: false
    };
    
    this.timeEntries.set(activeEntry.id, updatedEntry);
    return updatedEntry;
  }
}

export const storage = new MemStorage();
