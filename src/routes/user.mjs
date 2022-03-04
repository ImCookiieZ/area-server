import { Router } from 'express'
const router = Router();

import { deleteUser, createUser, login } from '../modules/db/userManagement.js'
import { checkUserIdReq, checkCreateUserReq } from '../middleware/security/user.js'
import { secureRouteMiddleware } from '../middleware/security/secureRouting.js'
import { getSubscriptions, getConnections } from '../modules/user/userInfos.js'

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         userName:
 *           type: string
 *         email:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         password:
 *           type: string
 */

// /**
//  * @swagger
//  * /user:
//  *   get:
//  *     summary: get information about the user
//  *     parameters:
//  *          - in: cookie
//  *            name: token
//  *            type: JWT
//  *            required: true
//  *            description: JWT user got on login
//  *     responses:
//  *       200:
//  *         description: user information
//  *         content:
//  *           application/json:
//  *              schema:
//  *                $ref: '#/components/schemas/User'
//  */

// router.get('/user', secureRouteMiddleware, checkUserIdReq, getUser)

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: create new user
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: user information
 *         headers:
 *           Set-Cookie:
 *             description: >
 *               Contains the session cookie named `token`.
 *               Pass this cookie back in subsequent requests.
 *         content:
 *           application/json:
 *              schema:
 *                token:
 *                  type: string
 *                  description: JWT token assigned to user
 */
router.post('/signup', checkCreateUserReq, createUser)

/**
 * 
 * /user:
 *   post:
 *     summary: create new user
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: user information
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 */
// router.post('/user', checkCreateUserReq, createUser)

/**
 * @swagger
 * /user:
 *   delete:
 *     summary: delete user who is logged in
 *     parameters:
 *          - in: cookie
 *            name: token
 *            type: JWT
 *            required: true
 *            description: JWT user got on login
 *     responses:
 *       200:
 *         description: DELETED
 */
router.delete('/user', secureRouteMiddleware, checkUserIdReq, deleteUser)

/**
 * @swagger
 * /login:
 *   get:
 *     summary: loging in for user
 *     parameters:
 *          - in: query
 *            name: email
 *            type: string
 *            required: true
 *            description: email of user
 *          - in: query
 *            name: password
 *            type: string
 *            required: true
 *            description: password of user
 *     responses:
 *       200:
 *         description: user information
 *         headers:
 *           Set-Cookie:
 *             description: >
 *               Contains the session cookie named `token`.
 *               Pass this cookie back in subsequent requests.
 *         content:
 *           application/json:
 *              schema:
 *                token:
 *                  type: string
 *                  description: JWT token assigned to user
 */

router.get('/token', login);
router.get('/login', login);
router.get('/user/subscriptions', secureRouteMiddleware, getSubscriptions)
router.get('/user/connections', secureRouteMiddleware, getConnections)

export default router;
