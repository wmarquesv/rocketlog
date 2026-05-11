import { Router } from "express";
import { DeliveriesController } from "@/controllers/DeliveriesController";
import { ensureAuthenticated } from "@/middlewares/ensureAuthenticated";

const deliveriesRoutes = Router();

const deliveriesController = new DeliveriesController();

deliveriesRoutes.use(ensureAuthenticated);
deliveriesRoutes.post("/", deliveriesController.create);

export { deliveriesRoutes };
