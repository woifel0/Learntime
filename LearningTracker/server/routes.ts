import express, { Router, type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCategorySchema, 
  insertActivitySchema, 
  insertTimeEntrySchema,
  insertUserSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = Router();
  
  // Categories endpoints
  apiRouter.get("/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve categories" });
    }
  });

  apiRouter.get("/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve category" });
    }
  });

  apiRouter.post("/categories", async (req, res) => {
    try {
      const parseResult = insertCategorySchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: fromZodError(parseResult.error).message 
        });
      }
      
      const category = await storage.createCategory(parseResult.data);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  apiRouter.put("/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const parseResult = insertCategorySchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: fromZodError(parseResult.error).message 
        });
      }
      
      const updatedCategory = await storage.updateCategory(id, parseResult.data);
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  apiRouter.delete("/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const success = await storage.deleteCategory(id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Activities endpoints
  apiRouter.get("/activities", async (req, res) => {
    try {
      const categoryId = req.query.categoryId;
      
      let activities;
      if (categoryId) {
        const parsedId = parseInt(categoryId as string);
        if (isNaN(parsedId)) {
          return res.status(400).json({ message: "Invalid category ID" });
        }
        activities = await storage.getActivitiesByCategory(parsedId);
      } else {
        activities = await storage.getActivities();
      }
      
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve activities" });
    }
  });

  apiRouter.get("/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }
      
      const activity = await storage.getActivity(id);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve activity" });
    }
  });

  apiRouter.post("/activities", async (req, res) => {
    try {
      const parseResult = insertActivitySchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: fromZodError(parseResult.error).message 
        });
      }
      
      // Check if the category exists
      const category = await storage.getCategory(parseResult.data.categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      const activity = await storage.createActivity(parseResult.data);
      res.status(201).json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  apiRouter.put("/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }
      
      const parseResult = insertActivitySchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: fromZodError(parseResult.error).message 
        });
      }
      
      // If updating category, check if it exists
      if (parseResult.data.categoryId) {
        const category = await storage.getCategory(parseResult.data.categoryId);
        if (!category) {
          return res.status(404).json({ message: "Category not found" });
        }
      }
      
      const updatedActivity = await storage.updateActivity(id, parseResult.data);
      if (!updatedActivity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      res.json(updatedActivity);
    } catch (error) {
      res.status(500).json({ message: "Failed to update activity" });
    }
  });

  apiRouter.delete("/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }
      
      const success = await storage.deleteActivity(id);
      if (!success) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete activity" });
    }
  });

  // Time Entries endpoints
  apiRouter.get("/time-entries", async (req, res) => {
    try {
      const activityId = req.query.activityId;
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      
      let timeEntries;
      
      if (activityId) {
        const parsedId = parseInt(activityId as string);
        if (isNaN(parsedId)) {
          return res.status(400).json({ message: "Invalid activity ID" });
        }
        timeEntries = await storage.getTimeEntriesByActivity(parsedId);
      } else if (startDate && endDate) {
        const parsedStartDate = new Date(startDate as string);
        const parsedEndDate = new Date(endDate as string);
        
        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
        
        timeEntries = await storage.getTimeEntriesByDateRange(parsedStartDate, parsedEndDate);
      } else {
        timeEntries = await storage.getTimeEntries();
      }
      
      res.json(timeEntries);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve time entries" });
    }
  });

  apiRouter.get("/time-entries/active", async (req, res) => {
    try {
      const activeEntry = await storage.getActiveTimeEntry();
      if (!activeEntry) {
        return res.status(404).json({ message: "No active time entry found" });
      }
      
      res.json(activeEntry);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve active time entry" });
    }
  });

  apiRouter.get("/time-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid time entry ID" });
      }
      
      const timeEntry = await storage.getTimeEntry(id);
      if (!timeEntry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      res.json(timeEntry);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve time entry" });
    }
  });

  apiRouter.post("/time-entries", async (req, res) => {
    try {
      const parseResult = insertTimeEntrySchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: fromZodError(parseResult.error).message 
        });
      }
      
      // Check if the activity exists
      const activity = await storage.getActivity(parseResult.data.activityId);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      const timeEntry = await storage.createTimeEntry(parseResult.data);
      res.status(201).json(timeEntry);
    } catch (error) {
      res.status(500).json({ message: "Failed to create time entry" });
    }
  });

  apiRouter.put("/time-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid time entry ID" });
      }
      
      const parseResult = insertTimeEntrySchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: fromZodError(parseResult.error).message 
        });
      }
      
      // If updating activity, check if it exists
      if (parseResult.data.activityId) {
        const activity = await storage.getActivity(parseResult.data.activityId);
        if (!activity) {
          return res.status(404).json({ message: "Activity not found" });
        }
      }
      
      const updatedTimeEntry = await storage.updateTimeEntry(id, parseResult.data);
      if (!updatedTimeEntry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      res.json(updatedTimeEntry);
    } catch (error) {
      res.status(500).json({ message: "Failed to update time entry" });
    }
  });

  apiRouter.post("/time-entries/stop", async (req, res) => {
    try {
      const stoppedEntry = await storage.stopActiveTimeEntry();
      if (!stoppedEntry) {
        return res.status(404).json({ message: "No active time entry found" });
      }
      
      res.json(stoppedEntry);
    } catch (error) {
      res.status(500).json({ message: "Failed to stop active time entry" });
    }
  });

  apiRouter.delete("/time-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid time entry ID" });
      }
      
      const success = await storage.deleteTimeEntry(id);
      if (!success) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete time entry" });
    }
  });

  // Stats endpoints
  apiRouter.get("/stats", async (req, res) => {
    try {
      const timeRange = req.query.timeRange || 'day'; // day, week, month
      
      // Get dates for the requested range
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
          break;
        case 'week':
          const day = now.getDay();
          startDate = new Date(now);
          startDate.setDate(now.getDate() - day);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      }
      
      // Get all time entries within the range
      const timeEntries = await storage.getTimeEntriesByDateRange(startDate, now);
      
      // Get all categories and activities
      const categories = await storage.getCategories();
      const activities = await storage.getActivities();
      
      // Calculate statistics
      const totalTimeInMs = timeEntries.reduce((total, entry) => {
        if (!entry.endTime) return total;
        
        const endTime = new Date(entry.endTime);
        const startTime = new Date(entry.startTime);
        return total + (endTime.getTime() - startTime.getTime());
      }, 0);
      
      const totalTimeInMinutes = Math.floor(totalTimeInMs / (1000 * 60));
      
      // Group by category
      const categoryStats = categories.map((category) => {
        const categoryActivities = activities.filter(activity => activity.categoryId === category.id);
        const categoryActivityIds = new Set(categoryActivities.map(activity => activity.id));
        
        const categoryTimeEntries = timeEntries.filter(entry => 
          categoryActivityIds.has(entry.activityId) && entry.endTime
        );
        
        const categoryTimeInMs = categoryTimeEntries.reduce((total, entry) => {
          if (!entry.endTime) return total;
          
          const endTime = new Date(entry.endTime);
          const startTime = new Date(entry.startTime);
          return total + (endTime.getTime() - startTime.getTime());
        }, 0);
        
        const categoryTimeInMinutes = Math.floor(categoryTimeInMs / (1000 * 60));
        const percentage = totalTimeInMinutes ? Math.round((categoryTimeInMinutes / totalTimeInMinutes) * 100) : 0;
        
        return {
          ...category,
          totalTime: categoryTimeInMinutes,
          percentage
        };
      });
      
      // Get recent activities with time entries
      const recentActivities = activities.map(activity => {
        const activityTimeEntries = timeEntries.filter(entry => 
          entry.activityId === activity.id && entry.endTime
        );
        
        if (activityTimeEntries.length === 0) return null;
        
        const category = categories.find(c => c.id === activity.categoryId);
        
        const totalTimeInMs = activityTimeEntries.reduce((total, entry) => {
          if (!entry.endTime) return total;
          
          const endTime = new Date(entry.endTime);
          const startTime = new Date(entry.startTime);
          return total + (endTime.getTime() - startTime.getTime());
        }, 0);
        
        const lastSession = activityTimeEntries
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];
        
        return {
          ...activity,
          categoryName: category?.name,
          categoryColor: category?.color,
          categoryIcon: category?.icon,
          totalTime: Math.floor(totalTimeInMs / (1000 * 60)),
          lastSession: lastSession.startTime
        };
      }).filter(Boolean)
      .sort((a, b) => new Date(b!.lastSession).getTime() - new Date(a!.lastSession).getTime())
      .slice(0, 5);
      
      // Get sessions count for the current period
      const sessionsCount = timeEntries.filter(entry => entry.endTime).length;
      
      // For daily progress chart (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        return date;
      }).reverse();
      
      const dailyProgress = last7Days.map(day => {
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dayTimeEntries = timeEntries.filter(entry => {
          const entryDate = new Date(entry.startTime);
          return entryDate >= day && entryDate < nextDay && entry.endTime;
        });
        
        const totalTimeInMs = dayTimeEntries.reduce((total, entry) => {
          if (!entry.endTime) return total;
          
          const endTime = new Date(entry.endTime);
          const startTime = new Date(entry.startTime);
          return total + (endTime.getTime() - startTime.getTime());
        }, 0);
        
        const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()];
        const isToday = day.getDate() === now.getDate() && 
                        day.getMonth() === now.getMonth() && 
                        day.getFullYear() === now.getFullYear();
        
        return {
          date: day,
          dayOfWeek,
          isToday,
          totalTime: Math.floor(totalTimeInMs / (1000 * 60))
        };
      });
      
      // Prepare stats response
      const stats = {
        totalTime: totalTimeInMinutes,
        sessionsCount,
        categories: categoryStats,
        recentActivities,
        dailyProgress
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate statistics" });
    }
  });

  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
