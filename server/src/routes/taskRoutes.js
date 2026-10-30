import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { createTask, deleteTask, getTask, listTasks, updateTask } from '../controllers/taskController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const statuses = ['Pending', 'In Progress', 'Completed'];
const priorities = ['Low', 'Medium', 'High'];
const categories = ['Work', 'Personal'];
const taskRules = (partial = false) => {
  const rules = [
  body('title').trim().isLength({ min: 1, max: 120 }).withMessage('Title must be 1–120 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be 1000 characters or less'),
  body('status').optional().isIn(statuses).withMessage('Choose a valid task status'),
  body('priority').optional().isIn(priorities).withMessage('Choose a valid priority'),
  body('category').optional().isIn(categories).withMessage('Choose a valid project'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Due date must be a valid date'),
  ];
  return partial ? rules.map(rule => rule.optional()) : rules;
};

router.use(requireAuth);
router.get('/', [query('status').optional().isIn(statuses), query('priority').optional().isIn(priorities), query('category').optional().isIn(categories), query('sort').optional().isIn(['dueDate', 'createdAt', 'priority', 'title']), query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 }), query('dueBefore').optional().isISO8601(), query('dueAfter').optional().isISO8601()], validate, listTasks);
router.post('/', taskRules(), validate, createTask);
router.get('/:id', [param('id').isMongoId().withMessage('Task ID is invalid')], validate, getTask);
router.patch('/:id', [param('id').isMongoId().withMessage('Task ID is invalid'), ...taskRules(true)], validate, updateTask);
router.delete('/:id', [param('id').isMongoId().withMessage('Task ID is invalid')], validate, deleteTask);
export default router;
