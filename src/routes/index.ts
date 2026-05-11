import { Router } from "express";

import { usersRoutes } from "./usersRoutes";
import { sessionRoutes } from "./sessionRoutes";
import { deliveriesRoutes } from "./deliveriesRoutes";

const routes = Router();

routes.use("/users", usersRoutes);
routes.use("/sessions", sessionRoutes);
routes.use("/deliveries", deliveriesRoutes);

export { routes };
