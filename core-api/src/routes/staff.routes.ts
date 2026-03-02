import { Router } from 'express';
import { StaffController } from '../controllers/staff.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const staffRoutes = Router();
const staffCtrl = new StaffController();

staffRoutes.use(authMiddleware);

staffRoutes.get('/', staffCtrl.listMyStaff);
staffRoutes.post('/', staffCtrl.addStaffMember);
staffRoutes.patch('/:id', staffCtrl.updateStaffMember);
staffRoutes.delete('/:id', staffCtrl.removeStaffMember);

export default staffRoutes;
