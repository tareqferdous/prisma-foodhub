import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { ContactMessageController } from "./contact.controller";

const router = Router();

router.post("/", ContactMessageController.createContactMessage);
router.get(
  "/",
  auth(UserRole.ADMIN),
  ContactMessageController.getAllContactMessages,
);

export const ContactMessageRoutes = router;
