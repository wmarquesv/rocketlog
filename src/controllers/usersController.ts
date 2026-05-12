import { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";
import { hash } from "bcrypt";
import { AppError } from "@/utils/appError";

class UsersController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().min(1).trim(),
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { name, email, password } = bodySchema.parse(request.body);

    const userWithSameEmail = await prisma.user.findFirst({ where: { email } });

    if (userWithSameEmail) {
      throw new AppError("Usuário com esse email já existe");
    }

    const hashedPassword = await hash(password, 8);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...UserWithoutPassword } = user;

    return response.status(201).json(UserWithoutPassword);
  }
}

export { UsersController };
