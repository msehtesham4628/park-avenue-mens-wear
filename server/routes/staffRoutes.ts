import { Router } from 'express';
import { staffController } from '../controllers/staffController.js';
import { optionalAuthenticateJWT } from '../middleware/authMiddleware.js';

const router = Router();

// Staff list
router.get('/', optionalAuthenticateJWT, staffController.getStaff);
router.get('/list', optionalAuthenticateJWT, staffController.getStaff);

// Permissions & Role definitions
router.get('/permissions', staffController.getPermissions);
router.post('/permissions', optionalAuthenticateJWT, staffController.createPermission);
router.delete('/permissions/:id', optionalAuthenticateJWT, staffController.deletePermission);

// Roles management
router.get('/roles', staffController.getRoles);
router.post('/roles', optionalAuthenticateJWT, staffController.createRole);
router.delete('/roles/:roleKey', optionalAuthenticateJWT, staffController.deleteRole);

// Staff member CRUD
router.post('/', optionalAuthenticateJWT, staffController.createStaff);
router.put('/:id', optionalAuthenticateJWT, staffController.updateStaff);
router.delete('/:id', optionalAuthenticateJWT, staffController.deleteStaff);

export default router;
