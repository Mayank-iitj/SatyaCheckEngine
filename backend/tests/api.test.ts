import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/lib/prisma";

describe("SatyaCheck API Integration Tests", () => {
  let adminToken: string;
  let testUserEmail = `testuser_${Date.now()}@test.com`;

  beforeAll(async () => {
    // Generate a test token by registering a test user
    const res = await request(app).post("/api/auth/register").send({
      email: testUserEmail,
      password: "password123",
      name: "Test User",
      role: "STUDENT"
    });
    
    // Some routes might need an admin token, but we'll focus on basics here
    adminToken = res.body.token;
  });

  afterAll(async () => {
    // Clean up test user
    await prisma.user.deleteMany({
      where: { email: testUserEmail }
    });
  });

  describe("Health Check", () => {
    it("should return ok status", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(res.body.name).toBe("SatyaCheck API");
    });
  });

  describe("Authentication", () => {
    it("should fail validation if missing fields on login", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "not-an-email"
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Validation failed");
    });

    it("should login successfully with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUserEmail,
        password: "password123"
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.email).toBe(testUserEmail);
    });
  });

  describe("Credentials", () => {
    it("should reject unauthorized requests to mine", async () => {
      const res = await request(app).get("/api/credentials/mine");
      expect(res.status).toBe(401);
    });

    it("should fetch credentials with valid token", async () => {
      const res = await request(app)
        .get("/api/credentials/mine")
        .set("Authorization", `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
