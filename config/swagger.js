import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import "dotenv/config";

const port = process.env.PORT || 3000;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RokKru Backend API Documentation",
      version: "1.0.0",
      description:
        "API Documentation for RokKru - v5 DEMO Final with JWT Sessions",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        UserType: {
          type: "object",
          properties: {
            user_type_id: {
              type: "integer",
              description: "The unique identifier for the user type",
            },
            user_type_name: {
              type: "string",
              description:
                "The name of the user type/role (e.g. Student, Mentor, Admin)",
            },
            create_date: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the user type was created",
            },
            update_date: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the user type was last updated",
            },
          },
        },
      },
      schemas: {
        RegisterRequest: {
          type: "object",
          required: ["email", "password", "user_type"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", minLength: 8, example: "SecurePass123!" },
            user_type: { type: "integer", example: 1 },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", example: "SecurePass123!" },
          },
        },
        OTPVerifyRequest: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            otp: { type: "string", example: "123456" },
          },
        },
        OTPVerifyResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "login success" },
            user: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
                email: { type: "string", example: "user@example.com" },
                user_type: { type: "integer", example: 1 },
              },
            },
          },
        },
        ResetPasswordRequest: {
          type: "object",
          required: ["oldPassword", "newPassword"],
          properties: {
            oldPassword: { type: "string" },
            newPassword: { type: "string", minLength: 8 },
          },
        },
        ForgotPasswordRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
          },
        },
        SetNewPasswordRequest: {
          type: "object",
          required: ["email", "newPassword"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            newPassword: { type: "string", minLength: 8 },
          },
        },
        ProfileResponse: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            email: { type: "string", example: "user@example.com" },
            status: { type: "string", example: "active" },
            role: { type: "string", example: "Student" },
          },
        },
        MessageResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/**/*.js", "./app.js", "./routes/v1/**/*.js"], // Paths to files with swagger comments
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(
    `📑 Swagger Documentation available at http://localhost:${port}/api-docs`,
  );
}

export default setupSwagger;
