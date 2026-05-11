import { Router } from "express";
import { DeliveriesController } from "@/controllers/DeliveriesController";
import { ensureAuthenticated } from "@/middlewares/ensureAuthenticated";
import { verifyUserAuthorization } from "@/middlewares/verifyUserAuthorization";

const deliveriesRoutes = Router();

const deliveriesController = new DeliveriesController();

deliveriesRoutes.use(ensureAuthenticated);
deliveriesRoutes.use(verifyUserAuthorization(["sale"]));
deliveriesRoutes.post("/", deliveriesController.create);

export { deliveriesRoutes };
